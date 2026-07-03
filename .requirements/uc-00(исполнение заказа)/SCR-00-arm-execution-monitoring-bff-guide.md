# SCR-00 «Исполнение заказа»: мониторинг слева — когда какой BFF вызывать (для фронта)

**Аудитория:** разработчик ARM — левая колонка **«МОНИТОРИНГ»** на экране исполнения.  
**Паспорт экрана:** `core/printing_operator_ui/screens/SCR-00-arm-execution-shell.md`  
**Wire:** `core/front-back-contract.md` (**ADR-0027**)  
**Группа BFF:** `users.admin.models_groups.frontOrderService` (внутри `users.admin.models_groups.MES` → `orderPlatformService`).

**Объём v1 (завершён на стенде):** только блок мониторинга **UI-00c / UI-00d / UI-00e** — метраж, таблицы рулонов 3+3, сводка «События по этапу».  
**Вне этого гайда:** шапка заказа (UI-00a), плашка машины (UI-00b), «Показать все» (UI-00f), сайдбар — отдельные пакеты / STUB.

---

## Зачем этот документ

После того как родительский SCR-00 знает **`work_area_id`** активного этапа, левая колонка заполняется **тремя read-only BFF** одной модели. Для каждого — три вопроса:

1. **Когда** вызывать?
2. **Что отправить** из UI?
3. **Куда положить ответ**?

**Приложение A** — песочница **Expression Builder** на стенде `10.83.8.18:6460` (проверка бэкенда до HTTP-шлюза).

---

## Компоновка блока (что покрывают BFF)

```text
┌─ МОНИТОРИНГ (слева) ──────────────────────────────────────────┐
│ UI-00b · Плашка машины              ← НЕ этот гайд (reuse snapshot) │
│ UI-00c · Вход на линию / Выход      ← getSummary (line_meters)    │
│ UI-00d · Входные (3) | Выходные (3) ← getRollTables               │
│        · колонка «Состав» на выходе                                 │
│ UI-00e · СОБЫТИЯ ПО ЭТАПУ (сводка)  ← getStageEvents              │
│ UI-00f · [Показать все]             ← НЕ этот гайд (detail STUB)  │
└────────────────────────────────────────────────────────────────────┘
```

Контекст: **`work_area_id`** текущего этапа (**IN_PROGRESS** / **PAUSED**). Демо smoke: **`207`** (`printing_d3`).

---

## Общее правило ответа BFF

| Поле | Успех | Ошибка |
|:---|:---|:---|
| `error_code` | `"OK"` | код метода |
| `error_message` | `""` | текст для оператора |
| `result` | таблица **одной** строки полезной нагрузки | не читать |

```text
если error_code !== "OK" → показать error_message, стоп
иначе → биндить поля из result (первая строка)
```

Вложенные таблицы (`line_meters`, `input_rolls`, `event_summary_rows`) приходят как **typed-table** (JSON в колонке или объект после парсинга шлюза). Берите `records[]` внутри.

---

## Что хранит фронт (мониторинг)

| Ключ | Откуда | Зачем |
|:---|:---|:---|
| `work_area_id` | родитель SCR-00 | все три вызова |
| `line_meters` | **getSummary** → `result.line_meters` | 4 цифры «вход/выход» |
| `input_rolls[]` | **getRollTables** → `result.input_rolls` | таблица входов (до 3) |
| `output_rolls[]` | **getRollTables** → `result.output_rolls` | таблица выходов + состав + блок |
| `preview_limit` | константа `"3"` или из ответа | эхо BFF |
| `event_summary_rows[]` | **getStageEvents** | строки «Брак» / «Простои» / «Настройка» |

**Когда перезагружать:** при смене `work_area_id`; после мутаций в дочерних SCR (SCR-04 списание, SCR-06 выпуск, SCR-07 событие), если пришёл `stage_registry_refresh_hint` / явный refresh от родителя — повторить **все три** read (или точечно по смыслу).

Три вызова **независимы** — можно параллельно после появления `work_area_id`.

---

## Демо-данные стенда (WA 207)

Этап **`207`** в статусе **`IN_PROGRESS`**. Целевые smoke после seed (`reshape_wa207_monitoring_demo.py`, `seed_wa207_stage_events.py`):

| BFF | Что ожидать (порядок величин) |
|:---|:---|
| **getSummary** | `input_roll` > 0 (есть ACTIVE вход), `output_total` >> 0 |
| **getRollTables** | 3 входа + 3 выхода; у выходов непустой `composition` (`;` между входами); один ACTIVE выход с коротким метражом |
| **getStageEvents** | **Брак** 1050 **м**, **Простои** 3 **ч** |

Точные цифры метража меняются после операций на этапе — ориентир: `anima-services/order/scenarios/bff-arm-execution-monitoring-*/live_implementation.md`.

---

## Момент M1 · Метраж вход/выход (UI-00c)

| | |
|:---|:---|
| **Триггер** | `work_area_id` известен; открытие SCR-00 / смена этапа |
| **BFF** | `getSummary` |
| **Модель** | `users.admin.models.armExecutionMonitoring` |
| **Квалифицированное имя** | `order_armExecutionMonitoring_getSummary` |

| Поле UI | Параметр BFF | Пример |
|:---|:---|:---|
| этап | `work_area_id` | `"207"` |

**Куда класть ответ** (`result`, 1 строка):

| Поле `line_meters` | Колонка UI |
|:---|:---|
| `input_total` | **Вход общий** |
| `input_roll` | **Вход ролик** (ACTIVE входы) |
| `output_total` | **Выход общий** |
| `output_roll` | **Выход ролик** (последний выход) |

Контракт: `anima-services/order/scenarios/bff-arm-execution-monitoring-summary/contract_bff_arm_execution_monitoring_summary.md`  
Live: `anima-services/order/scenarios/bff-arm-execution-monitoring-summary/live_implementation.md`

---

## Момент M2 · Таблицы рулонов 3+3 (UI-00d)

| | |
|:---|:---|
| **Триггер** | вместе с M1 (параллельно допустимо) |
| **BFF** | `getRollTables` |
| **Модель** | `users.admin.models.armExecutionMonitoring` |
| **Квалифицированное имя** | `order_armExecutionMonitoring_getRollTables` |

| Поле UI | Параметр BFF | Пример |
|:---|:---|:---|
| этап | `work_area_id` | `"207"` |
| лимит превью | `preview_limit` | `"3"` (default на BFF — тоже 3) |

**`input_rolls[]`:**

| Поле | Колонка UI |
|:---|:---|
| `barcode` | штрихкод / серия |
| `length_m` | метраж |

**`output_rolls[]`:**

| Поле | Колонка UI |
|:---|:---|
| `barcode` | штрихкод выхода |
| `length_m` | метраж |
| `composition` | **Состав** — штрихкоды входов через `;` |
| `blocked` | подсветка строки (красная) |
| `block_reason_label` | колонка «Причина»; если не заблокирован — `"-"` |

Штрихкод на стенде: `COALESCE(barcode, external_id)` рулона.

Контракт: `anima-services/order/scenarios/bff-arm-execution-monitoring-roll-tables/contract_bff_arm_execution_monitoring_roll_tables.md`  
Live: `anima-services/order/scenarios/bff-arm-execution-monitoring-roll-tables/live_implementation.md`

---

## Момент M3 · События по этапу — сводка (UI-00e)

| | |
|:---|:---|
| **Триггер** | вместе с M1 (параллельно допустимо) |
| **BFF** | `getStageEvents` |
| **Модель** | `users.admin.models.armExecutionMonitoring` |
| **Квалифицированное имя** | `order_armExecutionMonitoring_getStageEvents` |

| Поле UI | Параметр BFF | Пример |
|:---|:---|:---|
| этап | `work_area_id` | `"207"` |

**Куда класть ответ** — `result.event_summary_rows[]` (0–3 строки, фиксированный порядок):

| `row_kind` | `row_label` (первая колонка) | `quantity_uom` | `quantity` |
|:---|:---|:---|---:|
| `DEFECT` | Брак | `м` | сумма метража брака |
| `DOWNTIME` | Простои | `ч` | сумма часов |
| `SETUP` | Настройка | `м` | только код `120` |

Строки с `quantity = 0` **не приходят**. Пустой массив — **не ошибка** (пустая таблица).

Заголовок «ДАТА» на макете — фактически **категория** (`row_label`), не дата (**GAP-SCR00-STAGE-EVENTS-UI-01**).

Построчный журнал и регистрация — **SCR-07**, не этот BFF.

Контракт: `anima-services/order/scenarios/bff-arm-execution-monitoring-stage-events/contract_bff_arm_execution_monitoring_stage_events.md`  
Deploy/smoke: `tools/real-platform-live-connection/deploy_ui3_scr00_monitoring_stage_events_report.json`

---

## Сводка: блок → BFF

| UI-ID | Блок UI | BFF-функция (полный путь) | Параметры |
|:---|:---|:---|:---|
| UI-00c | Вход/выход сводка | `users.admin.models.armExecutionMonitoring.getSummary` | `work_area_id` |
| UI-00d | Таблицы 3+3 + состав | `users.admin.models.armExecutionMonitoring.getRollTables` | `work_area_id`, `preview_limit` |
| UI-00e | События по этапу | `users.admin.models.armExecutionMonitoring.getStageEvents` | `work_area_id` |

Все три функции — **одна модель** `armExecutionMonitoring`, группа **`frontOrderService`**.

---

## Чеклист интеграции

1. Без `work_area_id` — не вызывать; показать пустое состояние мониторинга.
2. `error_code !== "OK"` — `error_message` оператору; `result` не парсить.
3. Парсить вложенные таблицы из `result` (не путать с корневым wire).
4. **getStageEvents** требует этап **IN_PROGRESS** или **PAUSED** — иначе `JOURNAL_ACCESS_DENIED`.
5. Красная строка выхода — только `blocked === true` из BFF; причину не вычислять на фронте.
6. После SCR-04 / SCR-06 / SCR-07 — обновить мониторинг (хотя бы M1+M2).

---

# Приложение A. Песочница Expression Builder

**Зачем:** вручную повторить вызовы фронта на платформе до подключения HTTP-шлюза.

**Где:** AggreGate `10.83.8.18:6460` → `MES` → `orderPlatformService` → `frontOrderService` → модель **`armExecutionMonitoring`** → **Expression Builder** / вызов функции.

**Порядок smoke (WA 207):**

```text
1. getSummary
2. getRollTables
3. getStageEvents
```

(1–3 можно в любом порядке.)

---

### A.1 · Метраж (UI-00c)

```text
callFunction(
  "users.admin.models.armExecutionMonitoring",
  "getSummary",
  "207"
)
```

Проверить: `error_code=OK`, `result.work_area_id=207`, в `line_meters` четыре числа ≥ 0, `input_roll` > 0 на демо.

Негатив — пустой этап:

```text
callFunction(
  "users.admin.models.armExecutionMonitoring",
  "getSummary",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

### A.2 · Таблицы рулонов (UI-00d)

```text
callFunction(
  "users.admin.models.armExecutionMonitoring",
  "getRollTables",
  "207",
  "3"
)
```

Проверить: `error_code=OK`, `preview_limit=3`, до **3** строк в `input_rolls` и `output_rolls`; у выходов поля `composition`, `blocked`, `block_reason_label`.

Негатив — этап не найден:

```text
callFunction(
  "users.admin.models.armExecutionMonitoring",
  "getRollTables",
  "999999",
  "3"
)
```

Проверить: `WORK_AREA_NOT_FOUND`.

---

### A.3 · События по этапу (UI-00e)

```text
callFunction(
  "users.admin.models.armExecutionMonitoring",
  "getStageEvents",
  "207"
)
```

Проверить: `error_code=OK`, в `event_summary_rows` строки **Брак** ≈ **1050** `м` и **Простои** ≈ **3** `ч` (после seed).

Негатив — этап не в работе (подставьте завершённый `work_area_id` или снимите IN_PROGRESS):

Проверить: `JOURNAL_ACCESS_DENIED`, текст про активный этап.

---

# Приложение B. Пути BFF на платформе

| UI | Модель | Функция | Rule sets (RS) |
|:---|:---|:---|:---|
| UI-00c | `users.admin.models.armExecutionMonitoring` | `getSummary` | `rsArmExecutionMonitoringLineMetersOrchestrator`, `rsArmExecutionMonitoringLineMetersWire` |
| UI-00d | `users.admin.models.armExecutionMonitoring` | `getRollTables` | `rsArmExecutionMonitoringRollTablesOrchestrator`, `rsArmExecutionMonitoringRollTablesWire` |
| UI-00e | `users.admin.models.armExecutionMonitoring` | `getStageEvents` | `rsArmExecutionMonitoringStageEventsOrchestrator`, `rsArmExecutionMonitoringStageEventsWire` |

**Навигация в UI AggreGate:**

```text
Модели → MES → orderPlatformService → frontOrderService → armExecutionMonitoring
```

**Полные пути контекстов:**

- группа: `users.admin.models_groups.frontOrderService`
- модель: `users.admin.models.armExecutionMonitoring`
- функции: `users.admin.models.armExecutionMonitoring.getSummary` | `.getRollTables` | `.getStageEvents`

---

# Приложение C. Типовые ошибки

| Ситуация | `error_code` |
|:---|:---|
| Пустой / нулевой `work_area_id` | `INVALID_INPUT` |
| Нет этапа в БД | `WORK_AREA_NOT_FOUND` |
| Этап не IN_PROGRESS / PAUSED (только **getStageEvents**) | `JOURNAL_ACCESS_DENIED` |
| Ошибка SQL | `STORAGE_ERROR` |

---

# Приложение D. Ссылки

| Тема | Файл |
|:---|:---|
| Паспорт SCR-00 | `core/printing_operator_ui/screens/SCR-00-arm-execution-shell.md` |
| Wire BFF | `core/front-back-contract.md` |
| Summary live | `anima-services/order/scenarios/bff-arm-execution-monitoring-summary/live_implementation.md` |
| Roll tables live | `anima-services/order/scenarios/bff-arm-execution-monitoring-roll-tables/live_implementation.md` |
| Stage events contract | `anima-services/order/scenarios/bff-arm-execution-monitoring-stage-events/contract_bff_arm_execution_monitoring_stage_events.md` |
| Deploy отчёты | `tools/real-platform-live-connection/deploy_ui3_scr00_monitoring_*_report.json` |
| Демо seed рулонов | `tools/real-platform-live-connection/reshape_wa207_monitoring_demo.py` |
| Демо seed событий | `tools/real-platform-live-connection/seed_wa207_stage_events.py` |
| Prefill скана SCR-04 | `export/SCR-04-material-prefill-scan-bff-guide.md` |

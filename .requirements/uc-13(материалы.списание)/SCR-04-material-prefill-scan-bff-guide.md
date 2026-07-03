# SCR-04 «Материалы»: предзаполнение поля скана — BFF (для фронта)

**Аудитория:** разработчик ARM — блок **«МАТЕРИАЛЫ. СПИСАНИЕ/ВОЗВРАТ»** (поле штрихкода серии).  
**Паспорт экрана:** `core/printing_operator_ui/screens/SCR-04-material-write-off-return.md`  
**CL:** **CL-MAT-53** — `anima-services/materials/requirements/clarifications/CL-MAT-53-scr04-printing-single-active-input-roll-v1.md`  
**Wire:** `core/front-back-contract.md` (**ADR-0027**)  
**Группа BFF:** `users.admin.models_groups.frontTraceabilityService` (внутри `users.admin.models_groups.MES` → `traceabilityPlatformService`).

**Объём:** один read-BFF **до** скана — `getActiveInputPrefill`. Сам скан, списание, возврат — другие функции (`rollScanResolve`, `stageRollExecution`, …).

---

## Зачем этот документ

На **печати** на входе этапа может быть **не более одного активного** входного рулона (**CL-MAT-53** §1). Если он уже есть, оператору не нужно вводить серию заново — поле скана **предзаполняется**, а попытка зарегистрировать **другую** серию блокируется на этапе `resolveBarcodeOnStage`.

Этот BFF отвечает только на вопрос: **«есть ли сейчас активный вход, и нужно ли подставить его в поле скана?»**

**Приложение A** — песочница **Expression Builder** на стенде `10.83.8.18:6460`.

---

## Смысл полей (логические флаги)

| Поле | Тип | Смысл для UI |
|:---|:---|:---|
| `has_active_input_roll` | boolean | На этапе есть **хотя бы один** рулон с **ACTIVE** `meter_card` области **`STAGE_INPUT`** |
| `should_prefill_scan` | boolean | **Нужно ли** автоматически подставить серию в поле скана |
| `active_input_rolls[]` | array | Данные для подстановки и таблицы «Данные по серии» (read-only превью) |

### Как связаны флаги (v1)

```text
has_active_input_roll = EXISTS( ACTIVE STAGE_INPUT на work_area_id )

should_prefill_scan   = has_active_input_roll    // v1, профиль печати printing_*

active_input_rolls[]  = 0 или 1 строка           // для printing_* на стенде — максимум 1
```

**v1:** `should_prefill_scan` **всегда равен** `has_active_input_roll`. Отдельной бизнес-логики «есть активный, но не предзаполнять» на стенде **нет** — флаг заложен для будущих профилей ARM.

### Алгоритм на фронте

```text
при открытии SCR-04 / смене work_area_id:
  вызвать getActiveInputPrefill(work_area_id, arm_profile)

  если error_code !== "OK":
    показать error_message; поле скана пустое; стоп

  если should_prefill_scan === true:
    взять active_input_rolls[0]
    поле скана := series_key          // точная строка, пробелы значимы!
    таблицу «Данные по серии» можно заполнить из той же строки
      (nomenclature_code, nomenclature_name, current_length_m)
    кнопку «Найти» / авто-resolve — по UX (см. ниже)

  иначе:
    поле скана пустое; обычный сценарий скана
```

**Важно:** prefill **не заменяет** `resolveBarcodeOnStage`. Это read-снимок ACTIVE входа. Перед списанием по-прежнему нужен успешный resolve/register по **CL-MAT-37**, если оператор менял поле или данные устарели.

**Повторный скан той же серии** — `already_registered_on_stage` в resolve (**CL-MAT-49**), не этот BFF.

**Новая серия при активном входе** — resolve вернёт `scan_blocked_by_active_input=true` (**CL-MAT-53** §2); register **не** вызывать.

---

## Компоновка (где в UI)

```text
┌─ МАТЕРИАЛЫ. СПИСАНИЕ/ВОЗВРАТ ────────────────────────────────┐
│ UI-30 · [поле скана серии]  ← prefill сюда (series_key)        │
│         [Найти] → resolveBarcodeOnStage (другой BFF)          │
│ Informer спеки / баннер активного входа ← resolve, не prefill   │
│ ДАННЫЕ ПО СЕРИИ ← из resolve; при prefill можно черновик из BFF │
└────────────────────────────────────────────────────────────────┘
```

Контекст: **`work_area_id`** из SCR-00; этап **IN_PROGRESS** / **PAUSED**.

---

## Момент P1 · Init предзаполнения (UI-30)

| | |
|:---|:---|
| **Триггер** | раскрытие блока SCR-04; смена `work_area_id`; после успешного полного списания ACTIVE входа (опционально — refresh) |
| **BFF** | `getActiveInputPrefill` |
| **Модель** | `users.admin.models.stageActiveInputPrefill` |
| **Квалифицированное имя** | `traceability_stageActiveInputPrefill_getActiveInputPrefill` |

| Поле UI / контекст | Параметр BFF | Обяз. | Пример |
|:---|:---|:---:|:---|
| этап | `work_area_id` | да | `"207"` |
| профиль ARM | `arm_profile` | нет | `""` → BFF подставит **`printing_d3`** |

**Куда класть ответ** (`result`, 1 строка):

| Поле | Куда в UI |
|:---|:---|
| `has_active_input_roll` | внутренний state; индикатор «на входе есть рулон» |
| `should_prefill_scan` | **главный флаг** — подставлять ли `series_key` в поле скана |
| `active_input_rolls[0].series_key` | значение поля скана |
| `active_input_rolls[0].nomenclature_code` | код номенклатуры (черновик таблицы) |
| `active_input_rolls[0].nomenclature_name` | подпись (v1 = код) |
| `active_input_rolls[0].current_length_m` | метраж на сейчас |

### `active_input_rolls[]` (одна строка)

| Поле | Описание |
|:---|:---|
| `material_roll_id` | id рулона MES |
| `roll_trace_context_id` | контекст traceability |
| `series_key` | `barcode` или `external_id` — **то, что сканируют** |
| `nomenclature_code` | `material_type` |
| `nomenclature_name` | v1: дублирует код |
| `current_length_m` | остаток на рулоне |

Контракт: `anima-services/traceability/scenarios/bff-stage-active-input-prefill/contract_bff_stage_active_input_prefill.md`  
Live: `anima-services/traceability/scenarios/bff-stage-active-input-prefill/live_implementation.md`

---

## Связь с resolve (после prefill)

| Ситуация | Действие фронта |
|:---|:---|
| `should_prefill_scan=true`, оператор **не менял** поле | можно сразу вызвать `resolveBarcodeOnStage` с `series_key` |
| `should_prefill_scan=true`, оператор **стёр / изменил** серию | обычный resolve; при чужой серии — баннер §2 **CL-MAT-53** |
| `should_prefill_scan=false` | пустое поле; скан новой серии разрешён (если спека OK) |

Блокировка нового скана — в **`users.admin.models.rollScanResolve.resolveBarcodeOnStage`**, не в prefill.

Гайд по скану: `export/SCR-04-WA207-lot-barcode-reference.md` · live resolve: `anima-services/traceability/scenarios/bff-roll-scan-resolve/live_implementation.md`

---

## Демо-данные стенда (WA 207)

После reshape мониторинга на этапе **один ACTIVE** вход:

| Поле | Smoke-значение |
|:---|:---|
| `work_area_id` | `207` |
| `has_active_input_roll` | `true` |
| `should_prefill_scan` | `true` |
| `series_key` | `002672230  1` (два пробела перед `1` — **копировать точно**) |
| `material_roll_id` | `51` |
| `nomenclature_code` | `290A01-0010-0018` |
| `current_length_m` | `100.0` |

Попытка resolve другой серии при этом (напр. `002429160   19`): `scan_blocked_by_active_input=true`, баннер «На входе уже есть активный рулон».

---

## Сводка

| Действие | BFF-функция (полный путь) | Параметры |
|:---|:---|:---|
| Открытие / refresh поля скана | `users.admin.models.stageActiveInputPrefill.getActiveInputPrefill` | `work_area_id`, `arm_profile` |

---

## Чеклист интеграции

1. Вызывать **до** первого скана в сессии SCR-04 (и после закрытия ACTIVE входа).
2. Подставлять **`series_key` as-is** — пробелы в лотах значимы (`export/SCR-04-WA207-scan-lots-exact.txt`).
3. **`should_prefill_scan`** — единственный флаг «заполнять поле»; не дублировать логику через `has_active_input_roll` иначе.
4. Prefill **не отменяет** resolve/register — только UX.
5. Баннер блокировки нового скана — только из **resolve**, не из prefill.
6. `error_code !== "OK"` → `error_message`, поле скана не трогать.

---

# Приложение A. Песочница Expression Builder

**Где:** AggreGate `10.83.8.18:6460` → `MES` → `traceabilityPlatformService` → `frontTraceabilityService` → модель **`stageActiveInputPrefill`**.

**Порядок smoke (WA 207):**

```text
1. getActiveInputPrefill          → prefill ACTIVE входа
2. resolveBarcodeOnStage          → та же серия (повторный вход)
3. resolveBarcodeOnStage          → другая серия (блокировка)
```

---

### A.1 · Prefill — есть ACTIVE вход (позитив)

```text
callFunction(
  "users.admin.models.stageActiveInputPrefill",
  "getActiveInputPrefill",
  "207",
  "printing_d3"
)
```

Проверить: `error_code=OK`, `has_active_input_roll=true`, `should_prefill_scan=true`, **1** строка в `active_input_rolls[]`, `series_key=002672230  1`.

С пустым `arm_profile` (default):

```text
callFunction(
  "users.admin.models.stageActiveInputPrefill",
  "getActiveInputPrefill",
  "207",
  ""
)
```

Проверить: тот же результат (default `printing_d3`).

---

### A.2 · Prefill — нет активного входа

Используйте этап без ACTIVE `STAGE_INPUT` или после полного списания входа на демо.

Проверить: `error_code=OK`, `has_active_input_roll=false`, `should_prefill_scan=false`, `active_input_rolls[]` пустой.

---

### A.3 · Prefill — негатив

Пустой этап:

```text
callFunction(
  "users.admin.models.stageActiveInputPrefill",
  "getActiveInputPrefill",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

### A.4 · Resolve — повтор той же серии (после A.1)

```text
callFunction(
  "users.admin.models.rollScanResolve",
  "resolveBarcodeOnStage",
  "207",
  "002672230  1",
  "printing_d3"
)
```

Проверить: `error_code=OK`, `already_registered_on_stage=true`, `scan_blocked_by_active_input=false`.

---

### A.5 · Resolve — другая серия при активном входе (блокировка)

```text
callFunction(
  "users.admin.models.rollScanResolve",
  "resolveBarcodeOnStage",
  "207",
  "002429160   19",
  "printing_d3"
)
```

Проверить: `error_code=OK`, `scan_blocked_by_active_input=true`, `stage_spec_banner_visible=true`, заголовок «На входе уже есть активный рулон», `already_registered_on_stage=false`.

---

# Приложение B. Пути BFF на платформе

| Назначение | Модель | Функция | Rule sets |
|:---|:---|:---|:---|
| Prefill скана | `users.admin.models.stageActiveInputPrefill` | `getActiveInputPrefill` | `rsStageActiveInputPrefillOrchestrator`, `rsStageActiveInputPrefillWire` |
| Скан / блокировка | `users.admin.models.rollScanResolve` | `resolveBarcodeOnStage` | `rsRollScanResolveOrchestrator`, `rsRollScanResolveWire` |

**Навигация в UI AggreGate:**

```text
Модели → MES → traceabilityPlatformService → frontTraceabilityService
  → stageActiveInputPrefill
  → rollScanResolve
```

**Полные пути:**

- группа: `users.admin.models_groups.frontTraceabilityService`
- prefill: `users.admin.models.stageActiveInputPrefill.getActiveInputPrefill`
- resolve: `users.admin.models.rollScanResolve.resolveBarcodeOnStage`

---

# Приложение C. Типовые ошибки (prefill)

| Ситуация | `error_code` |
|:---|:---|
| Пустой `work_area_id` | `INVALID_INPUT` |
| Этап не найден | `WORK_AREA_NOT_FOUND` |
| Ошибка SQL | `STORAGE_ERROR` |

---

# Приложение D. Ссылки

| Тема | Файл |
|:---|:---|
| CL-MAT-53 (канон флагов) | `anima-services/materials/requirements/clarifications/CL-MAT-53-scr04-printing-single-active-input-roll-v1.md` |
| Паспорт SCR-04 | `core/printing_operator_ui/screens/SCR-04-material-write-off-return.md` |
| Wire BFF | `core/front-back-contract.md` |
| Prefill live | `anima-services/traceability/scenarios/bff-stage-active-input-prefill/live_implementation.md` |
| Resolve live (R11) | `anima-services/traceability/scenarios/bff-roll-scan-resolve/live_implementation.md` |
| Deploy/smoke | `tools/real-platform-live-connection/deploy_ui3_scr04_active_input_roll_report.json` |
| Лоты WA 207 | `export/SCR-04-WA207-scan-lots-exact.txt` |
| Мониторинг SCR-00 | `export/SCR-00-arm-execution-monitoring-bff-guide.md` |

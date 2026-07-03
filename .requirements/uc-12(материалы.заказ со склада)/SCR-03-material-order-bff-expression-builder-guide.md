# SCR-03 «Заказ материалов»: когда какой BFF вызывать (для фронта)

**Аудитория:** разработчик ARM — экран **SCR-03**, левая колонка (заказ материалов).  
**Макет и UI-ID:** `core/printing_operator_ui/screens/SCR-03-material-order.md` (**UC-12**).  
**Wire:** `core/front-back-contract.md` (**ADR-0027**).  
**Правая колонка** («Локация у машины», блокировка) — другие BFF; здесь только **левый поток заказа**.

---

## Зачем этот документ

На экране у вас **таблицы**, **тоглы**, **кнопки** и **информер**. Каждое действие оператора в какой-то момент должно привести к **одному вызову BFF** с конкретными полями.

Этот текст отвечает на три вопроса фронтендера:

1. **В какой момент** (какая кнопка / какое событие) дергать бэкенд?
2. **Что отправить** — из каких полей UI и накопленного черновика?
3. **Куда положить ответ** — какая таблица / баннер / локальное состояние?

**Приложение A** в конце — как **на платформе AggreGate** вручную повторить те же вызовы в Expression Builder. Это не способ интеграции продакшн-фронта, а **песочница**: убедиться, что бэкенд отвечает так, как вы ожидаете, прежде чем подключать HTTP/шлюз.

---

## Экран: что вы строите

```text
┌─ ЛЕВАЯ КОЛОНКА (этот документ) ─────────────────────────┐
│ [Фильтр: машина PR120]                                  │
│ ┌ Таблица этапов ──────────────── галки ─────────────┐ │
│ │ 207 · 2. Печать · …                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Сформировать заказ]  ← BFF compose                     │
│ ┌ Таблица строк заказа (спека, кг) ─────────────────┐ │
│ └─────────────────────────────────────────────────────┘ │
│ ☐ Заказать конкретные рулоны/серии  ← BFF list pick     │
│ ┌ Таблица лотов (галки) ─────────────────────────────┐ │
│ └─────────────────────────────────────────────────────┘ │
│ [Добавить в заказ]  ← BFF merge                         │
│ Ко времени · Комментарий · ☐ Смена материалов           │
│ [Отправить заявку]  ← BFF submit   [Очистить] ← только UI│
└─────────────────────────────────────────────────────────┘
```

**Правая колонка:** информер ответа **1S** заполняется из **последнего submit** (`submit_banner_*`). Таблица «Локация у машины» **не** обновляется из submit — только по **«Обновить»** (**CL-MAT-10**).

---

## Общее правило ответа BFF

Любой BFF на wire отдаёт **одну строку** с полями:

| Поле | Успех | Ошибка |
|:---|:---|:---|
| `error_code` | `"OK"` | код, напр. `INVALID_INPUT` |
| `error_message` | `""` | текст для оператора |
| `result` | **таблица строк метода** | не читать |

Плюс **соседние колонки** той же строки: `compose_session_id`, `resource_id`, `submit_banner_*` и т.д. — **не** внутри вложенного `result.items`.

**Алгоритм на фронте:**

```text
если error_code !== "OK" → показать error_message, стоп
иначе → биндить result в нужную таблицу + прочитать соседние поля wire
```

Баннер после отправки (**CL-MAT-50**): если `submit_banner_visible === true` → заголовок `submit_banner_title`, текст `submit_banner_detail` (аналог баннера скана в SCR-04).

---

## Что хранит фронт (черновик заказа)

Между вызовами BFF держите локальное состояние — бэкенд **не** помнит правки оператора между compose и submit.

| Ключ состояния | Откуда | Зачем |
|:---|:---|:---|
| `area_resource_id` | фильтр машины | init, фильтрация этапов |
| `stages[]` | ответ **init** → `result` | таблица этапов, галки |
| `selected_work_area_ids[]` | галки в таблице этапов | compose, submit |
| `compose_session_id` | ответ **compose** (сосед wire) | pick, merge, submit |
| `draft_lines[]` | ответ **compose** → `result` + правки кг в UI | таблица заказа, submit |
| `pick_toggle_on` | тогл UI | показывать блок лотов |
| `pick_candidates[]` | ответ **listPickCandidates** → `result` | таблица лотов |
| `selected_lots[]` | галки в таблице лотов | merge, submit (`lot_refs`) |
| `delivery_due_at`, `warehouse_comment`, `is_material_change` | поля формы | submit |

Кнопка **«Очистить заявку»** — сброс этого состояния **без BFF**.

---

## Путь оператора → ваш код

Ниже — **пять моментов** с BFF. Номера совпадают с UI-ID в паспорте экрана.

---

### Момент 1 · Открыл экран или сменил машину (UI-20)

| | |
|:---|:---|
| **Триггер** | `onMount`, смена фильтра **«Машина»** |
| **Кнопка** | нет (автозагрузка) |
| **BFF** | `initWorkbench` |
| **Модель** | `users.admin.models.materialDeliveryWorkbench` |
| **Группа** | `users.admin.models_groups.frontMaterialsService` |

**Отправить:**

| Поле UI / состояния | Параметр BFF | Примечание |
|:---|:---|:---|
| выбранная машина | `area_resource_id` | напр. `PR120` |
| (опционально) | `refresh_plan` | обычно `false` |
| — | `arm_profile` | **не передавать** на SCR-03 v1; BFF подставит `printing_d2` (**CL-MAT-04**) |

**Положить ответ:**

| Куда в UI | Откуда в ответе |
|:---|:---|
| таблица **этапов** | `result` — массив строк этапа (как SCR-01) |
| (опционально) подпись профиля | `arm_profile` |
| echo машины | `resource_id` |

**Запомнить:** `stages[]`, `area_resource_id`. Галки этапов — только на фронте до compose.

Контракт: `anima-services/materials/scenarios/bff-material-delivery-workbench-init/contract_bff_material_delivery_workbench_init.md`

---

### Момент 2 · «Сформировать заказ» (UI-21)

| | |
|:---|:---|
| **Триггер** | клик **«Сформировать заказ»** |
| **Условие** | отмечен хотя бы один этап (на демо печати — один) |
| **BFF** | `composeOrderLines` |
| **Модель** | `users.admin.models.materialDeliveryCompose` |

**Отправить:**

| Поле UI | Параметр BFF |
|:---|:---|
| id отмеченных этапов, через запятую | `work_area_ids` | макс. **3** (**CL-MAT-08**) |

Пример: один этап `207` → `"207"`. Два этапа → `"207,46"`.

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| таблица **строк заказа** (номенклатура, кг) | `result` — строки `draft_lines` |
| скрытое / для следующих шагов | `compose_session_id` (сосед wire), напр. `CMP-207` |
| включить тогл лотов? | `pick_toggle_enabled` — на D2 печати часто `false` |

**Запомнить:** `compose_session_id`, `draft_lines[]`. Колонку **кг** оператор редактирует локально — в submit уйдут уже изменённые значения.

Контракт: `anima-services/materials/scenarios/bff-material-delivery-compose/contract_bff_material_delivery_compose.md`

---

### Момент 3 · Включил тогл «конкретные рулоны/серии» (UI-22)

| | |
|:---|:---|
| **Триггер** | тогл **включён** (и `pick_toggle_enabled` с compose был бы true, если бы BFF разрешил) |
| **BFF** | `listPickCandidates` |
| **Модель** | `users.admin.models.materialDeliveryPickRolls` |

**Отправить** (для **одной** строки заказа / одного этапа; при нескольких — вызов по строке):

| Поле | Параметр |
|:---|:---|
| этап строки | `work_area_id` |
| номенклатура строки | `nomenclature_code` |
| из черновика | `compose_session_id` |

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| таблица **лотов** (серия, кол-во, галка) | `result` — до 10 строк |
| не показывать к выбору | строки с `blocked === true` |

**Важно про `lot_ref`:** в DWH серия — строка с **точным числом пробелов** (не схлопывать при копировании). Эталон WA 207: **`export/SCR-04-WA207-scan-lots-exact.txt`**.

Контракт: `anima-services/materials/scenarios/bff-material-delivery-pick-rolls/contract_bff_list_pick_candidates.md`

---

### Момент 4 · «Добавить в заказ» (UI-22a)

| | |
|:---|:---|
| **Триггер** | клик **«Добавить в заказ»** |
| **Условие** | тогл включён, отмечены лоты в таблице |
| **BFF** | `mergeSelectedRollsIntoDraft` |
| **Модель** | та же `materialDeliveryPickRolls` |

**Отправить:**

| Поле | Параметр |
|:---|:---|
| черновик | `compose_session_id` |
| этап-источник строки | `line_ref` (= `work_area_id` строки) |
| отмеченные лоты | `selected_lots` — таблица: `lot_ref`, `nomenclature_code`, `requested_quantity` |

**Положить ответ:** обновить `draft_lines[]` / подтаблицу выбранных лотов в строке заказа из `result` (фрагмент черновика с `selected_lots`).

Контракт: `anima-services/materials/scenarios/bff-material-delivery-pick-rolls/contract_bff_merge_selected_rolls.md`

---

### Момент 5 · «Отправить заявку» (UI-21b)

| | |
|:---|:---|
| **Триггер** | клик **«Отправить заявку»** |
| **BFF** | `submitConsolidatedRequest` |
| **Модель** | `users.admin.models.materialDeliverySubmit` |

**Отправить:**

| Поле формы / черновика | Параметр BFF |
|:---|:---|
| те же id этапов, что при compose | `work_area_ids` |
| таблица заказа (с правками кг) | `lines[]` |
| «Ко времени» | `delivery_due_at` | формат `yyyy-MM-dd HH:mm:ss` или `""` |
| комментарий склада | `warehouse_comment` |
| ☑ Смена материалов | `is_material_change` |
| идентификатор оператора | `operator_ref` |
| трассировка | `compose_session_id` |

**Строка `lines[]`:** `nomenclature_code`, `delivery_kind`, `requested_quantity`, `quantity_uom`, `series_ref`, `lot_refs[]`.

- **Без лотов** (основной демо-путь): `lot_refs` — пустой массив → одна consolidated-заявка.
- **С лотами:** в `lot_refs` — выбранные `lot_ref` → возможно **несколько** заявок **1S**; смотрите `order_results[]` (**CL-MAT-40**).

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| информер **справа вверху** | `submit_banner_visible`, `submit_banner_title`, `submit_banner_detail` в `result` |
| (лог / детали) | `material_delivery_request_id`, `order_result`, `order_results[]` |

**Не делать:** не обновлять таблицу «Локация у машины» из этого ответа.

Контракт: `anima-services/materials/scenarios/bff-material-delivery-submit/contract_bff_material_delivery_submit.md`  
Live / баннер: `anima-services/materials/scenarios/bff-material-delivery-submit/live_implementation.md` (**CL-MAT-50**).

---

## Сводка: кнопка → BFF

| Действие оператора | UI-ID | BFF-функция | Заполняет таблицу / блок |
|:---|:---:|:---|:---|
| Открыл экран / сменил машину | UI-20 | `initWorkbench` | **Этапы** |
| **Сформировать заказ** | UI-21 | `composeOrderLines` | **Строки заказа** |
| Тогл конкретных лотов | UI-22 | `listPickCandidates` | **Лоты** (wh 100) |
| **Добавить в заказ** | UI-22a | `mergeSelectedRollsIntoDraft` | лоты в **черновике** |
| **Отправить заявку** | UI-21b | `submitConsolidatedRequest` | **Информер 1S** |
| **Очистить заявку** | UI-25 | — | сброс state на фронте |

Полные пути моделей — в **приложении B**.

---

## Демо-данные WA 207 (smoke на стенде)

Используйте для проверки интеграции и песочницы Expression Builder:

| Смысл | Значение |
|:---|:---|
| Машина | `PR120` |
| Этап | `207` («2. Печать») |
| Номенклатура | `290A01-0010-0018` |
| `compose_session_id` после compose | `CMP-207` |
| Запрошено кг (пример) | `372.37` · `KGM` |

Лоты для pick: **`export/SCR-04-WA207-scan-lots-exact.txt`** (пробелы в `lot_ref` значимы).

---

## Помогашка: сброс демо-пути (перед повторным прогоном)

Если на этапе **207** уже есть зарегистрированные рулоны (SCR-04), отправленные заявки (SCR-03) или списания — повторный скан/заказ может вести себя как «уже зарегистрировано». Для **ручного** сброса в Expression Builder:

| | |
|:---|:---|
| **BFF** | `resetWorkAreaMaterialDemoPath` |
| **Модель** | `users.admin.models.materialDeliveryDevReset` |
| **Группа** | `users.admin.models_groups.frontMaterialsService` |

```text
callFunction("users.admin.models.materialDeliveryDevReset", "resetWorkAreaMaterialDemoPath", "207", "front-dev")
```

**Что делает:** удаляет входные рулоны этапа (`STAGE_INPUT`), заявки на материалы и списания по `work_area_id`; статус этапа **IN_PROGRESS** не меняет. После вызова `active_stage_inputs_after` в ответе должно быть **0**.

Подробнее: `anima-services/materials/scenarios/bff-material-delivery-dev-reset/README.md`. Автотесты deploy — только на **WA 46**, не на 207.

---

## Чеклист интеграции (левый поток)

1. Смена машины → `initWorkbench` → таблица этапов из `result`.
2. Галки + **Сформировать заказ** → `composeOrderLines` → таблица заказа + сохранить `compose_session_id`.
3. (Опционально) тогл → `listPickCandidates` → таблица лотов.
4. (Опционально) **Добавить в заказ** → `mergeSelectedRollsIntoDraft`.
5. **Отправить заявку** → `submitConsolidatedRequest` → информер по `submit_banner_*`.
6. Правая таблица локации — отдельный BFF по **Обновить** (UI-23).

---

# Приложение A. Песочница Expression Builder

## Зачем

Вы **имитируете фронт на платформе**: те же параметры, что отправил бы UI, — и смотрите сырой wire-ответ. Так проще отладить бэкенд до подключения шлюза.

**Где:** AggreGate `10.83.8.18:6460` → `MES` → `materialsPlatformService` → `frontMaterialsService` → модель → функция → **Вызов / Expression Builder**.

**Порядок** — как у оператора на экране:

```text
1. initWorkbench          (открытие / машина)
2. composeOrderLines        (Сформировать заказ)
3. listPickCandidates       (тогл — опционально)
4. mergeSelectedRollsIntoDraft (Добавить — опционально)
5. submitConsolidatedRequest (Отправить заявку)
```

---

### A.1 · init — таблица этапов

```text
callFunction("users.admin.models.materialDeliveryWorkbench", "initWorkbench", "PR120", false, "")
```

Проверить: `error_code=OK`, в `result` есть строка с `work_area_id=207`.

---

### A.2 · compose — таблица заказа

```text
callFunction("users.admin.models.materialDeliveryCompose", "composeOrderLines", "207")
```

Проверить: `compose_session_id=CMP-207`, в `result` строка `290A01-0010-0018`, `requested_quantity≈372.37`.

---

### A.3 · list pick — таблица лотов (опционально)

```text
callFunction("users.admin.models.materialDeliveryPickRolls", "listPickCandidates", "207", "290A01-0010-0018", "CMP-207")
```

`lot_ref` копировать только из **`export/SCR-04-WA207-scan-lots-exact.txt`**.

---

### A.4 · merge — добавить лоты (опционально)

Три лота smoke (точные строки):

```
002429160   18
002672230  1
002429160   19
```

```text
callFunction(
  "users.admin.models.materialDeliveryPickRolls",
  "mergeSelectedRollsIntoDraft",
  "CMP-207",
  "207",
  table(
    "<<lot_ref><S>><<nomenclature_code><S>><<requested_quantity><E>>",
    "002429160   18", "290A01-0010-0018", 1,
    "002672230  1", "290A01-0010-0018", 1,
    "002429160   19", "290A01-0010-0018", 1
  )
)
```

---

### A.5 · submit — информер 1S

**Вариант без лотов** (как на демо печати без тогла):

```text
callFunction(
  "users.admin.models.materialDeliverySubmit",
  "submitConsolidatedRequest",
  "207",
  table(
    "<<nomenclature_code><S>><<delivery_kind><S>><<requested_quantity><S>><<quantity_uom><S>><<series_ref><S>><<lot_refs><T<<lot_ref><S>>>>",
    "290A01-0010-0018", "RAW_MATERIAL", "372.37", "KGM", "", table("<<lot_ref><S>>")
  ),
  "",
  "Демо WA207 — Expression Builder",
  false,
  "front-dev-smoke",
  "CMP-207"
)
```

Проверить: `error_code=OK`, `submit_banner_visible=true`, `submit_banner_title=Заявка принята`.

**С одним лотом** — в `lot_refs` вложить `table("<<lot_ref><S>>", "002429160   18")` (пробелы как в файле лотов).

---

# Приложение B. Пути BFF на платформе

| Шаг | Модель | Функция |
|:---|:---|:---|
| init | `users.admin.models.materialDeliveryWorkbench` | `initWorkbench` |
| compose | `users.admin.models.materialDeliveryCompose` | `composeOrderLines` |
| pick | `users.admin.models.materialDeliveryPickRolls` | `listPickCandidates` / `mergeSelectedRollsIntoDraft` |
| submit | `users.admin.models.materialDeliverySubmit` | `submitConsolidatedRequest` |

Группа моделей: `users.admin.models_groups.frontMaterialsService` (внутри `users.admin.models_groups.MES`).

---

# Приложение C. Типовые ошибки

| Ситуация | `error_code` |
|:---|:---|
| Пустая машина в init | `INVALID_INPUT` |
| Пустые этапы в compose | `INVALID_INPUT` |
| Пустой submit | `INVALID_INPUT` |
| Этап без спеки в pick | `SPEC_NOT_FOUND` |

---

# Приложение D. Ссылки для углубления

| Тема | Файл |
|:---|:---|
| Паспорт экрана, все UI-ID | `core/printing_operator_ui/screens/SCR-03-material-order.md` |
| Wire BFF | `core/front-back-contract.md` |
| Баннер submit | `anima-services/materials/requirements/clarifications/CL-MAT-50-scr03-submit-1s-banner-wire-v1.md` |
| Лоты WA 207 | `export/SCR-04-WA207-scan-lots-exact.txt` |
| Deploy/smoke отчёты | `tools/real-platform-live-connection/deploy_ui3_scr03_*_report.json` |

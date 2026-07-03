# SCR-06 «Выпуск»: когда какой BFF вызывать (для фронта)

**Аудитория:** разработчик ARM — collapsible-блок **«ВЫПУСК»** (**UC-15** / **UC-08**).  
**Паспорт экрана:** `core/printing_operator_ui/screens/SCR-06-roll-release.md`  
**Wire:** `core/front-back-contract.md` (**ADR-0027**)  
**Группа BFF:** `users.admin.models_groups.frontMaterialsService` (внутри `users.admin.models_groups.MES`).

Блокировка (**UI-57** / **UI-58**) — **reuse** BFF заказа материалов: `export/SCR-03-material-order-right-column-bff-guide.md` § UI-24b (**CL-MAT-35**).

---

## Зачем этот документ

На экране выпуска несколько read-вызовов, одна тяжёлая кнопка **«Зарегистрировать выпуск»** и нижний блок блокировки. Для каждого момента — три вопроса:

1. **Когда** вызывать бэкенд?
2. **Что отправить** из UI?
3. **Куда положить ответ**?

**Приложение A** — песочница **Expression Builder** на стенде `10.83.8.18:6460` (проверка бэкенда до HTTP-шлюза).

---

## Компоновка экрана

```text
┌─ ВЫПУСК (collapse) ──────────────────────────────────────────┐
│ UI-50 · ДАННЫЕ С МАШИНЫ (read-only)     ← machineParamsSnapshot │
│ UI-51 · ДАННЫЕ ПО СЕРИИ (read-only)     ← getReleaseFormInit    │
│ UI-52–54 · метраж, вес, склад, перемотка  ← локально + init     │
│ UI-55 · ВЫПУСКИ ПАРТИИ (таблица)        ← getBatchReleases       │
│ UI-56 · [Привязать]                     ← OFF v1 (no-op)       │
│ Таблица ВХОДНЫХ рулонов (☑)             ← listStageInputRolls** │
│ UI-57–58 · блокировка                   ← machineMaterialBlock  │
│ UI-59 · [Печать этикетки]               ← prepareReleaseLabel   │
│ UI-60 · [Зарегистрировать выпуск]       ← registerRelease       │
└────────────────────────────────────────────────────────────────┘

** Домен traceability (не отдельный BFF SCR-06) — для блокировки входов.
```

Контекст экрана: **`work_area_id`** текущего этапа (этап **IN_PROGRESS** / **PAUSED**).

---

## Вес NETTO и BRUTTO (обязательно для UI)

По **UC-15** и **CL-MAT-29** §4 для **полуфабриката** нетто **всегда равно** брутто.

| На макете | Поведение v1 |
|:---|:---|
| Два поля NETTO / BRUTTO | **Активно для ввода только одно** (рекомендуем **NETTO** / «Вес, кг») |
| Второе поле | **Read-only**, дублирует первое **сразу при вводе** (зеркало) |
| Визуал | Второе поле **подсветить** (например фон `read-only` / приглушённый label «Брутто = нетто») |
| В BFF | На submit уходит **одно** число **`output_weight_kg`** |

```text
onChange(activeWeightField):
  mirrorField.value = activeWeightField.value   // 1:1
  state.output_weight_kg = activeWeightField.value

registerRelease(..., output_weight_kg, ...)   // одно поле на wire
```

Не отправляйте `net_weight_kg` / `gross_weight_kg` отдельно — их дублирует оркестратор внутри `registerRollRelease`.

---

## Общее правило ответа BFF

| Поле | Успех | Ошибка |
|:---|:---|:---|
| `error_code` | `"OK"` | код метода |
| `error_message` | `""` | текст для оператора |
| `result` | таблица строк метода | не читать |

**Исключение partial fail (**CL-MAT-31**):** при `registerRelease` и `traceability_output_recorded === true` читайте **соседние** колонки wire (`output_material_roll_id`, `integration_1s_status`, …) даже если `error_code !== "OK"`.

```text
если error_code !== "OK" && !partialFailRegisterRelease → показать error_message, стоп
иначе → биндить result + соседние поля
```

---

## Что хранит фронт

| Ключ | Откуда | Зачем |
|:---|:---|:---|
| `work_area_id` | контекст ARM этапа | все вызовы |
| `predicted_external_series_key` | **init** → `result` | read-only UI-51 + **обязателен** в submit |
| `destination_warehouse_code` | init default + select UI-53 | submit |
| `destination_warehouses[]` | init | select складов |
| `output_length_m` | ввод UI-52 | submit |
| `output_weight_kg` | **одно** активное поле веса | submit |
| `requires_rewind` | checkbox UI-54 | submit |
| `batch_rows[]` | batch list → `result.batch_rows` | таблица UI-55 |
| `batch_as_of` | batch list | подпись «актуально на …» |
| `input_rolls[]` | `listStageInputRollsForWorkArea` | таблица входов + ☑ блокировки |
| `selected_input_series_refs[]` | галки на входных | `submitBlockRequest` |
| `block_reasons[]` | `listBlockReasons` | select UI-57 |
| `selected_reason_code`, `block_comment` | форма UI-58 | блокировка |
| retry ids | ответ partial fail submit | повтор materials |

**Когда кнопки активны:**

```text
нет work_area_id                          → disable всё, кроме заглушек
нет output_length_m > 0 || output_weight_kg > 0 → disable «Зарегистрировать»
нет predicted_external_series_key         → disable «Зарегистрировать»
нет выбранной строки выпуска              → disable «Печать этикетки» (до первого выпуска)
нет selected_input + reason               → disable «Передать блокировку»
пустой external_series_key у входа        → строку показать, галку блокировки скрыть/disable
```

После успешного submit при `batch_releases_refresh_hint === true` → повторить **init** (серия) и **batch list**.

---

## Демо-данные стенда (smoke)

| Смысл | Значение |
|:---|:---|
| Этап печати (основной) | `work_area_id = "207"` · `area_id = 514249` |
| Этап альтернативный | `work_area_id = "209"` · `area_id = 900002` |
| Init WA207 (пример, счётчик меняется) | `predicted_external_series_key` вида `514249 9` — **всегда брать свежий init** |
| Init WA209 (пример) | `900002 9` — **всегда брать свежий init** |
| Submit метраж/вес (smoke) | `output_length_m = 3.3`, `output_weight_kg = 3.3` |
| Склад | `WH100` |
| Код причины блокировки | `BLOCK_CURING_VIOLATION` |
| Серия входа для блокировки | `external_series_key` из `listStageInputRollsForWorkArea` (не пустой) |

**Важно:** `predicted_external_series_key` в submit **должен совпадать** с последним `getReleaseFormInit` для того же `work_area_id`. Иначе `SERIES_PREVIEW_MISMATCH`.

**Штрихкод в таблице выпусков (UI-55):** после регистрации `batch_rows[].barcode` = та же строка серии, что ушла в submit (`predicted_external_series_key`), например `514249 13` — **не** заглушка `OUT-207-N` (**CL-MAT-34**).

---

## Путь оператора → ваш код

Номера **M1–M9** — только в этом документе.

---

### Момент M1 · Открыли блок «Выпуск» или сменили этап

| | |
|:---|:---|
| **Триггер** | expand блока, смена `work_area_id` |
| **Вызовы** | параллельно или последовательно: **M2**, **M3**, **M5**, **M6** |

---

### Момент M2 · Данные с машины (UI-50)

| | |
|:---|:---|
| **BFF** | `getMachineParamsSnapshot` |
| **Модель** | `users.admin.models.machineParamsSnapshot` |

**Отправить:**

| Поле UI | Параметр |
|:---|:---|
| этап | `work_area_id` |
| машина (если есть) | `area_resource_id` — можно `""` |
| профиль ARM | `arm_profile` — напр. `"printing_d3"` |

**Положить ответ:** `result.params[]` → read-only таблица/карточки (stub **CL-MAT-23**).

Контракт: `anima-services/materials/scenarios/bff-machine-params-snapshot/contract_bff_machine_params_snapshot.md`

---

### Момент M3 · Данные по серии (UI-51, UI-53)

| | |
|:---|:---|
| **BFF** | `getReleaseFormInit` |
| **Модель** | `users.admin.models.rollReleaseInit` |

**Отправить:** `work_area_id`

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| read-only серия | `result.predicted_external_series_key` |
| счётчик (опц.) | `result.release_count_on_work_area` |
| select складов | `result.destination_warehouses[]` |
| default склада | `result.default_destination_warehouse_code` |

**Запомнить:** `predicted_external_series_key` для submit.

Контракт: `anima-services/materials/scenarios/bff-roll-release-init/contract_bff_roll_release_init.md`  
Live: `anima-services/materials/scenarios/bff-roll-release-init/live_implementation.md`

---

### Момент M4 · Форма метража и веса (UI-52–54)

| | |
|:---|:---|
| **BFF** | **нет** — только локальное состояние |

| Поле UI | В submit |
|:---|:---|
| Метраж, м | `output_length_m` |
| **Одно** активное поле веса | `output_weight_kg` |
| Склад | `destination_warehouse_code` |
| ☑ Требуется перемотка | `requires_rewind` |

**Проверка метража на submit (UI-60, live R4):**

```text
eligible_sum = SUM(consumed) по входным рулонам этапа,
               ещё НЕ привязанным ни к одному выпуску на work_area_id

если eligible_sum > 0:
  output_length_m <= eligible_sum + 500   // иначе OUTPUT_EXCEEDS_CONSUMED
иначе (все входы уже «заняты» прошлыми выпусками):
  output_length_m <= 500                  // только допуск +500 без привязки
```

На WA207 после многих smoke-выпусков `eligible_sum` часто **0** → максимум **500 м** на новый выпуск.

---

### Момент M5 · Таблица «Выпуски партии» (UI-55)

| | |
|:---|:---|
| **Триггер** | M1, после успешного submit (`batch_releases_refresh_hint`) |
| **BFF** | `getBatchReleases` · `users.admin.models.rollReleaseBatchList` |
| **Группа** | `users.admin.models_groups.frontMaterialsService` |
| **Стенд** | **LIVE** (2026-06-26) |

**Отправить:** `work_area_id`

**Положить ответ:** `result.batch_rows[]` → таблица; `result.release_count_on_work_area`, `result.as_of`

**Колонки UI ↔ wire (как на макете «РУЛОНЫ» / выпуски):**

| Колонка UI | Поле `batch_rows[]` |
|:---|:---|
| ШТРИХКОД | `barcode` |
| НОМЕНКЛАТУРА | `nomenclature_name` |
| КОЛ-ВО 1 | `quantity_primary` |
| ЕД. ИЗМ. 1 | `uom_primary` (`KG` → подпись «кг») |
| КОЛ-ВО 2 | `quantity_secondary` |
| ЕД. ИЗМ. 2 | `uom_secondary` (`M` → «пог. м» / метраж) |

**CL-MAT-32:** кол-во 1 = **вес**, кол-во 2 = **метраж**.

**Блокировка (внешний учёт, `remains_out`):** те же поля, что на экране локации SCR-03 (**CL-MAT-40** §3):

| Поле wire | Смысл |
|:---|:---|
| `blocked` | `true` только если серия (`barcode` / `lot`) есть в `remains_out` и `blocked=true` |
| `block_reason_code` | код из `remains_out.blocktype` при блокировке |
| `status_label` | `""` — серии нет в DWH; **Доступно** / **Заблокирован** — если строка есть |

**UI:** строку с `blocked === true` подсвечивать **красным** (фон строки / текст штрихкода); чекбокс блокировки SCR-06 — по **входным** рулонам (M6), не по этой таблице.

После успешного `submitBlockRequest` и репликации из **1S** признак появится при следующем `getBatchReleases`.

#### Подсветка и статусы (обязательно для UI-55)

Таблица выпусков — **только read-only** индикатор блокировки из **1S/DWH**. Логика совпадает с таблицей локации SCR-03 (`export/SCR-03-material-order-right-column-bff-guide.md` § R1): фронт **не** вычисляет `blocked` сам и **не** ставит чекбоксы на строках UI-55.

| `blocked` | `status_label` | Отображение |
|:---:|:---|:---|
| `false` | `""` | обычная строка — серии **ещё нет** в `remains_out` (выпуск только в MES, 1S не отразил) |
| `false` | `Доступно` | обычная строка — серия в учёте, блокировки нет |
| `true` | `Заблокирован` | **красная подсветка** строки: фон `danger` / `alert` **или** красный текст колонки **ШТРИХКОД**; опционально badge/tooltip с `block_reason_code` |

```text
rowClass(batchRow):
  if (batchRow.blocked === true) return 'row-blocked'   // CSS: красный фон или красный barcode
  return ''

// Не использовать status_label для enable/disable кнопок на этой таблице — только blocked.
// Печать этикетки (M8) и регистрация выпуска (M4) от блокировки в UI-55 не зависят (v1).
```

**Когда обновлять таблицу:** после M1 (`getBatchReleases`), после успешного **M4** (`registerRelease` → `batch_releases_refresh_hint`), после **M7** блокировки входов — когда оператор снова откроет/обновит экран; признак блокировки **выпуска** появится после репликации **1S** в `remains_out`, не сразу после submit.

**Пример wire-строки (WA207, без блока):**

```json
{
  "barcode": "OUT-207-2",
  "nomenclature_name": "DEMO-OUT-NOM",
  "quantity_primary": 33,
  "uom_primary": "KG",
  "quantity_secondary": 100,
  "uom_secondary": "M",
  "blocked": false,
  "block_reason_code": "",
  "status_label": "Доступно"
}
```

**Не путать с M6:** чекбоксы ☑ и `submitBlockRequest` — только для **входных** рулонов (`listStageInputRollsForWorkArea`); таблица UI-55 блокировку **не** инициирует.

Контракт BFF: `anima-services/materials/scenarios/bff-roll-release-batch-list/contract_bff_roll_release_batch_list.md`  
Домен: `anima-services/materials/scenarios/list-work-area-production-releases/contract_list_work_area_production_releases.md`

---

### Момент M6 · Входные рулоны для блокировки (таблица с ☑)

| | |
|:---|:---|
| **Триггер** | M1, refresh после списания/входа на этапе |
| **Вызов** | домен traceability (**не** отдельный BFF SCR-06) |
| **Функция** | `listStageInputRollsForWorkArea` |
| **Модель** | `users.admin.models.rollTraceInquiry` |
| **Группа** | `users.admin.models_groups.traceabilityService` |

**Отправить:** `work_area_id` (BIGINT на wire домена)

**Положить ответ:** `input_rolls[]` — колонки: `barcode`, `external_series_key`, `nomenclature_name`, `quantity_primary` / `quantity_secondary`, `stage_input_card_status`, …

**Для блокировки:** из отмеченных строк взять **`external_series_key`** → `series_ref` в `submitBlockRequest` (**CL-MAT-35**).

Альтернатива (тяжелее, SCR-04): `materials_rollStageRegistry_getStageRollRegistry` → `registry_rows[]`.

Контракт: `anima-services/traceability/scenarios/list-stage-input-rolls-for-work-area/contract_list_stage_input_rolls_for_work_area.md`

---

### Момент M7 · Блокировка (UI-57–58) — reuse SCR-03

Идентично `export/SCR-03-material-order-right-column-bff-guide.md` § R3–R4, но **`series_ref`** — из **M6** (`external_series_key` входного рулона), не из `remains_out`.

| Шаг | BFF | Модель |
|:---|:---|:---|
| Загрузка причин | `listBlockReasons` | `machineMaterialBlock` |
| Submit | `submitBlockRequest` | `machineMaterialBlock` |

Мультивыбор (**US-156**): **отдельный** `submitBlockRequest` на каждую выбранную серию v1.

Контракты: `anima-services/materials/scenarios/bff-machine-material-block/contract_bff_*.md`

---

### Момент M8 · Печать этикетки выпуска (UI-59)

| | |
|:---|:---|
| **Триггер** | клик **«Печать этикетки»** |
| **Условие** | выбрана строка в таблице **выпусков** UI-55 |
| **BFF** | `prepareReleaseLabel` |
| **Модель** | `users.admin.models.rollReleaseLabel` |

**Отправить** (один из id):

| Поле | Параметр |
|:---|:---|
| этап | `work_area_id` |
| выпуск | `material_production_release_id` |
| или рулон | `material_roll_id` (число id **или** штрихкод/серия в слоте) |

**Положить ответ:** `result.report_path`, `result.report_parameters`, `result.template_code` → preview PDF на клиенте (**ADR-0028**).

Контракт: `anima-services/materials/scenarios/bff-roll-release-label/contract_bff_roll_release_label.md`  
Live: `anima-services/materials/scenarios/bff-roll-release-label/live_implementation.md`

---

### Момент M9 · Зарегистрировать выпуск (UI-60) — сложный BFF

| | |
|:---|:---|
| **Триггер** | клик **«Зарегистрировать выпуск»** |
| **BFF** | `registerRelease` |
| **Модель** | `users.admin.models.rollReleaseSubmit` |

**Отправить:**

| Поле UI | Параметр BFF |
|:---|:---|
| этап | `work_area_id` |
| серия с UI-51 | `predicted_external_series_key` |
| метраж | `output_length_m` |
| **один** вес | `output_weight_kg` |
| склад | `destination_warehouse_code` |
| перемотка | `requires_rewind` |
| оператор | `operator_ref` |
| retry (пусто на первом проходе) | `output_material_roll_id`, `output_roll_trace_context_id`, `external_series_key`, `production_series_id` → `""` |

**Успех — положить:**

| Куда | Откуда |
|:---|:---|
| сводка | `result` |
| входы выпуска | `result.input_rolls` (таблица) |
| refresh таблицы выпусков | `result.batch_releases_refresh_hint === true` |

**Partial fail:** читать `traceability_output_recorded`, ids для retry — **CL-MAT-31**.

Контракт: `anima-services/materials/scenarios/bff-roll-release-submit/contract_bff_roll_release_submit.md`  
Оркестрация: **CL-MAT-30**

---

### Момент M6b · «Привязать» (UI-56)

**v1: no-op** — кнопку не вешать на BFF (**CL-MAT-29** §6).

---

## Покрытие стенда (текущая версия)

| UI | BFF / вызов | Стенд `10.83.8.18:6460` | Примечание |
|:---|:---|:---|:---|
| UI-50 | `machineParamsSnapshot.getMachineParamsSnapshot` | reuse, stub | как SCR-04 |
| UI-51 | `rollReleaseInit.getReleaseFormInit` | **LIVE** | smoke PASS |
| UI-52–54 | — | локально | |
| UI-55 | `rollReleaseBatchList.getBatchReleases` | **LIVE** | WA207: 12 строк (пример) |
| UI-56 | — | OFF | |
| входы ☑ | `rollTraceInquiry.listStageInputRollsForWorkArea` | **LIVE** | домен |
| UI-57–58 | `machineMaterialBlock.*` | **LIVE** reuse | как SCR-03 |
| UI-59 | `rollReleaseLabel.prepareReleaseLabel` | **LIVE** | |
| UI-60 | `rollReleaseSubmit.registerRelease` | **LIVE** | R2 smoke PASS |

Документ **полный для интеграции фронта v1** по всем BFF SCR-06 на стенде `10.83.8.18:6460`.

**Операционное отличие стенда (R4 2026-06-26):** gate метража — сумма списаний **непривязанных** входов + 500 м; если таких входов нет — max **500 м** (`OUTPUT_EXCEEDS_CONSUMED`). См. `patch_roll_release_output_length_gate.py`.

---

# Приложение A. Песочница Expression Builder

**Где:** AggreGate `10.83.8.18:6460` → `MES` → `materialsPlatformService` → `frontMaterialsService` / `traceabilityService` → модель → **Expression Builder**.

**Порядок smoke (WA207):**

```text
1. getMachineParamsSnapshot
2. getReleaseFormInit          → скопировать predicted_external_series_key
3. listStageInputRollsForWorkArea
4. listBlockReasons
5. getBatchReleases
6. registerRelease             (ключ из шага 2!)
7. prepareReleaseLabel           (после успешного 6)
8. submitBlockRequest            (серия из шага 3)
```

---

### A.1 · Параметры машины (UI-50)

```text
callFunction(
  "users.admin.models.machineParamsSnapshot",
  "getMachineParamsSnapshot",
  "207",
  "",
  "printing_d3"
)
```

Проверить: `error_code=OK`, `snapshot_status=STUB`, 3 параметра (`RUN_LENGTH`, …).

Пустой этап:

```text
callFunction(
  "users.admin.models.machineParamsSnapshot",
  "getMachineParamsSnapshot",
  "",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

### A.2 · Init серии (UI-51) — позитив и негатив

Позитив:

```text
callFunction(
  "users.admin.models.rollReleaseInit",
  "getReleaseFormInit",
  "207"
)
```

Проверить: `error_code=OK`, непустой `predicted_external_series_key` (формат `{area_id} {n}`, пробел между частями), `default_destination_warehouse_code=WH100`.

Негатив — пустой этап:

```text
callFunction(
  "users.admin.models.rollReleaseInit",
  "getReleaseFormInit",
  ""
)
```

Проверить: `INVALID_INPUT`.

Негатив — этап не найден:

```text
callFunction(
  "users.admin.models.rollReleaseInit",
  "getReleaseFormInit",
  "999999"
)
```

Проверить: `WORK_AREA_NOT_FOUND`.

---

### A.3 · Входные рулоны (таблица для блокировки)

```text
callFunction(
  "users.admin.models.rollTraceInquiry",
  "listStageInputRollsForWorkArea",
  207
)
```

Проверить: `error_code=OK` или доменный пустой `input_rolls[]` без ошибки; для блокировки найти строку с непустым `external_series_key`.

---

### A.4 · Блокировка (UI-57–58) — reuse SCR-03

Словарь:

```text
callFunction("users.admin.models.machineMaterialBlock", "listBlockReasons")
```

Проверить: `error_code=OK`, **5** причин, `source=STUB_V1`.

Submit (подставьте `series_ref` из A.3):

```text
callFunction(
  "users.admin.models.machineMaterialBlock",
  "submitBlockRequest",
  "ВСТАВИТЬ_external_series_key_ИЗ_A3",
  "BLOCK_CURING_VIOLATION",
  "",
  "scr06-smoke"
)
```

Проверить: `error_code=OK`, `request_status=ACCEPTED`.

Негатив — пустая серия:

```text
callFunction(
  "users.admin.models.machineMaterialBlock",
  "submitBlockRequest",
  "",
  "BLOCK_CURING_VIOLATION",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

### A.5 · Выпуски партии (UI-55) — BFF

```text
callFunction(
  "users.admin.models.rollReleaseBatchList",
  "getBatchReleases",
  "207"
)
```

Проверить: `error_code=OK`, `result.release_count_on_work_area` > 0, `result.batch_rows[]` — `barcode`, `nomenclature_name`, `quantity_primary`/`uom_primary` (кг), `quantity_secondary`/`uom_secondary` (м).

Диагностика домена (без BFF):

```text
callFunction(
  "users.admin.models.materialProduction",
  "listWorkAreaProductionReleases",
  "207"
)
```

---

### A.6 · Зарегистрировать выпуск (UI-60) — позитив

**Сначала A.2** — скопируйте `predicted_external_series_key` **без изменений**.

```text
callFunction(
  "users.admin.models.rollReleaseSubmit",
  "registerRelease",
  "207",
  "ВСТАВИТЬ_predicted_external_series_key_ИЗ_A2",
  3.3,
  3.3,
  "WH100",
  false,
  "scr06-smoke",
  "",
  "",
  "",
  ""
)
```

Проверить: `error_code=OK`, `traceability_output_recorded` не требуется при успехе; в `result` — `release_status=LOCKED`, `integration_1s_status=ACCEPTED`, `batch_releases_refresh_hint=true`, `external_series_key` **равен** переданному predicted (эхо **CL-MAT-34**).

Альтернативный этап:

```text
callFunction(
  "users.admin.models.rollReleaseSubmit",
  "registerRelease",
  "209",
  "ВСТАВИТЬ_predicted_ИЗ_getReleaseFormInit(209)",
  3.3,
  3.3,
  "WH100",
  false,
  "scr06-smoke",
  "",
  "",
  "",
  ""
)
```

---

### A.7 · Зарегистрировать выпуск — негативные потоки

Устаревшая серия (без повторного init):

```text
callFunction(
  "users.admin.models.rollReleaseSubmit",
  "registerRelease",
  "207",
  "WRONG 999",
  3.3,
  3.3,
  "WH100",
  false,
  "scr06-smoke",
  "",
  "",
  "",
  ""
)
```

Проверить: `SERIES_PREVIEW_MISMATCH`, `traceability_output_recorded=false`.

Невалидный склад:

```text
callFunction(
  "users.admin.models.rollReleaseSubmit",
  "registerRelease",
  "207",
  "ВСТАВИТЬ_predicted_ИЗ_A2",
  3.3,
  3.3,
  "WH999",
  false,
  "",
  "",
  "",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

Пустые обязательные поля:

```text
callFunction(
  "users.admin.models.rollReleaseSubmit",
  "registerRelease",
  "",
  "",
  0,
  0,
  "WH100",
  false,
  "",
  "",
  "",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

### A.8 · Этикетка выпуска (UI-59)

После успешного A.6 — `material_roll_id` из `result`:

```text
callFunction(
  "users.admin.models.rollReleaseLabel",
  "prepareReleaseLabel",
  "207",
  "",
  "ВСТАВИТЬ_output_material_roll_id",
  "scr06-smoke"
)
```

Или по `material_production_release_id` из `result`.

Проверить: `error_code=OK`, `template_code=RELEASE_LABEL`, `report_make_succeeded=true`.

Негатив — нет id:

```text
callFunction(
  "users.admin.models.rollReleaseLabel",
  "prepareReleaseLabel",
  "207",
  "",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

---

## Ссылки

| Тема | Файл |
|:---|:---|
| Паспорт SCR-06 | `core/printing_operator_ui/screens/SCR-06-roll-release.md` |
| Матрица UI | `core/printing_operator_ui/ui_scenario_coverage_matrix.md` |
| Вес net=brutto | `anima-services/materials/requirements/clarifications/CL-MAT-29-scr06-roll-release-screen-v1.md` §4 |
| Блокировка reuse | `anima-services/materials/requirements/clarifications/CL-MAT-35-scr06-release-block-stub-v1.md` |
| Блокировка SCR-03 | `export/SCR-03-material-order-right-column-bff-guide.md` |
| Init live | `anima-services/materials/scenarios/bff-roll-release-init/live_implementation.md` |
| Label live | `anima-services/materials/scenarios/bff-roll-release-label/live_implementation.md` |
| Submit smoke | `tools/real-platform-live-connection/patch_roll_release_submit_r2_fixes_report.json` |
| Block live | `anima-services/materials/scenarios/bff-machine-material-block/live_implementation.md` |

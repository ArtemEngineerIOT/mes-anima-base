# SCR-03 «Заказ материалов»: правая колонка — когда какой BFF вызывать (для фронта)

**Аудитория:** разработчик ARM — экран **SCR-03**, **правая колонка** (локация, этикетка, блокировка).  
**Левая колонка (заказ):** `export/SCR-03-material-order-bff-expression-builder-guide.md`  
**Паспорт экрана:** `core/printing_operator_ui/screens/SCR-03-material-order.md` (**UC-12**).  
**Wire:** `core/front-back-contract.md` (**ADR-0027**).  
**Группа BFF:** `users.admin.models_groups.frontMaterialsService` (внутри `users.admin.models_groups.MES`).

Верхний баннер ответа **1S** — эхо левого submit; здесь **не** описывается (см. левый гайд, **CL-MAT-50**).

---

## Зачем этот документ

На правой колонке три независимых действия с BFF. Для каждого — ответ на три вопроса:

1. **В какой момент** (кнопка / событие) вызывать бэкенд?
2. **Что отправить** — из какого поля UI?
3. **Куда положить ответ** — какая таблица / toast / preview?

**Приложение A** — песочница **Expression Builder** на стенде `10.83.8.18:6460` с **рабочими** smoke-данными (PR120, серия `002642110   2`). Это проверка бэкенда до подключения HTTP-шлюза, не способ продакшн-интеграции.

---

## Правая колонка: что вы строите

```text
┌─ ПРАВАЯ КОЛОНКА ─────────────────────────────────────────────┐
│ (баннер 1S — из левого submit, не этот документ)                │
│                                                                 │
│ UI-23 · Таблица «Локация у машине»                              │
│ ┌ Машина | Номенклатура | Серия | Кол-во | Статус | … ─────┐ │
│ └────────────────────────────────────────────────────────────┘ │
│ [Обновить]  ← BFF location                                      │
│                                                                 │
│ UI-24a · [Печать этикетки]  ← BFF label (только series_ref)    │
│                                                                 │
│ UI-24b · [Причина v] [Комментарий] [Передать блокировку]       │
│          ↑ listBlockReasons          ↑ submitBlockRequest       │
└─────────────────────────────────────────────────────────────────┘
```

**Связка данных:** фильтр **машины** на экране → таблица локации → **выбранная строка** → из неё `series_ref` для печати и блокировки.

---

## Общее правило ответа BFF

| Поле | Успех | Ошибка |
|:---|:---|:---|
| `error_code` | `"OK"` | напр. `INVALID_INPUT`, `UNKNOWN_REASON_CODE` |
| `error_message` | `""` | текст для оператора |
| `result` | таблица строк метода | не читать |

```text
если error_code !== "OK" → показать error_message, стоп
иначе → биндить result + соседние поля wire (as_of, resource_ids, …)
```

---

## Что хранит фронт (правая колонка)

| Ключ | Откуда | Зачем |
|:---|:---|:---|
| `selected_machine_ids[]` | фильтр машины SCR-03 (тот же, что для левой колонки) | `resource_ids` в location |
| `location_kind_filters` | чекбоксы сырьё / ПФ / упаковка | флаги `include_*` |
| `location_rows[]` | ответ **location** → `result` | таблица UI-23 |
| `location_as_of` | ответ **location** → `as_of` | подпись «актуально на …» |
| `selected_location_row` | клик по строке таблицы | `series_ref` для UI-24a и UI-24b |
| `block_reasons[]` | ответ **listBlockReasons** → `result` | select причин |
| `selected_reason_code` | select UI-24b | вход submit |
| `block_comment` | поле комментария | опционально в submit |

**Когда кнопки активны:**

```text
нет машины в фильтре              → disable «Обновить»
нет selected_location_row         → disable «Печать этикетки» и «Передать блокировку»
пустой selected_location_row.series_ref → disable «Печать» и «Блокировку»
нет selected_reason_code          → disable «Передать блокировку»
blocked === true или !row_selectable → строку показать, действия по ней отключить
```

---

## Демо-данные PR120 (smoke на стенде, PASS)

Используйте в шлюзе и в Expression Builder:

| Смысл | Значение |
|:---|:---|
| Машина | `PR120` |
| Location: все виды | `getMachineMaterialLocation("PR120", true, true, true, "")` → **4 строки**, `OK` |
| Location: только сырьё | `true, false, false` → **2 строки** (Сырьё / ГП) |
| Location: только упаковка | `false, false, true` → **2 строки** |
| Строка без серии (пример) | `Поддон 1200*800 б/у`, `series_ref=""` |
| Серия для печати/блокировки | `002642110   2` — **3 пробела перед `2`**, не схлопывать |
| Номенклатура по серии | `BOPET CGPU 12 mc 1138 mm`, длина `690.500` |
| Код причины (submit) | `BLOCK_CURING_VIOLATION` |
| Пустой `resource_ids` | `INVALID_INPUT` |
| Пустая серия в label/submit | `INVALID_INPUT` |
| `BLOCK_UNKNOWN` в submit | `UNKNOWN_REASON_CODE` |

Для UI-24a/UI-24b в таблице location выберите строку с **непустым** `series_ref` (на стенде — серия выше).

---

## Путь оператора → ваш код

Четыре момента с BFF. Номера **R1–R4** — только в этом документе (правая колонка).

---

### Момент R1 · Таблица локации (UI-23)

| | |
|:---|:---|
| **Триггер** | открытие SCR-03 (машина уже выбрана), смена машины, клик **«Обновить»** |
| **Кнопка** | **Обновить** (смена чекбоксов вида — тоже через «Обновить») |
| **BFF** | `getMachineMaterialLocation` |
| **Модель** | `users.admin.models.machineMaterialLocation` |
| **Группа** | `users.admin.models_groups.frontMaterialsService` |

**Отправить:**

| Поле UI / state | Параметр BFF | Пример |
|:---|:---|:---|
| выбранная машина (массив на фронте) | `resource_ids` (CSV на платформе) | `"PR120"` |
| несколько машин | `resource_ids` | `"PR120,PR110"` |
| чекбокс «Сырьё» | `include_raw_material` | `true` |
| чекбокс «ПФ» | `include_semi_finished` | `true` |
| чекбокс «Упаковка» | `include_packaging` | `true` |
| — | `arm_profile` | `""` → BFF подставит `printing_d2` |

**Положить ответ:**

| Куда в UI | Откуда в ответе |
|:---|:---|
| таблица **локации** | `result[]` — **напрямую**, без обёртки `location_rows` |
| подпись времени среза | `as_of` |
| echo машин | `resource_ids` |

Колонки строки `result` (live):

| Поле BFF | Колонка UI |
|:---|:---|
| `resource_id` | машина |
| `nomenclature_name`, `nomenclature_kind_label` | номенклатура, **Вид** |
| `series_ref` | **Серия** — дальше в UI-24a / UI-24b |
| `quantity`, `quantity_uom` | количество, ед. |
| `status_label` | статус |
| `fr_code` | FR |
| `blocked`, `block_reason_code` | read-only; строка `alert` если заблокирована |
| `expiry_date` | срок годности |
| `row_selectable` | можно ли выбрать для действий |

**Запомнить:** `location_rows[]`, `location_as_of`. При обновлении сбросить `selected_location_row`, если строка пропала.

**Wire-пример (после шлюза):**

```json
{
  "error_code": "OK",
  "error_message": "",
  "result": [
    {
      "resource_id": "PR120",
      "nomenclature_name": "Поддон 1200*800 б/у",
      "nomenclature_kind_label": "Упаковка",
      "series_ref": "",
      "quantity": 29,
      "quantity_uom": "PCE/NMB",
      "status_label": "Доступно",
      "fr_code": "",
      "blocked": false,
      "block_reason_code": "",
      "expiry_date": "",
      "row_selectable": true
    }
  ],
  "as_of": "2026-06-24T10:12:00",
  "resource_ids": ["PR120"]
}
```

Контракт: `anima-services/materials/scenarios/bff-machine-material-location/contract_bff_get_machine_material_location.md`  
Live: `anima-services/materials/scenarios/bff-machine-material-location/live_implementation.md` (R13)

---

### Момент R2 · «Печать этикетки» (UI-24a)

| | |
|:---|:---|
| **Триггер** | клик **«Печать этикетки»** |
| **Условие** | выбрана строка локации, `series_ref` **не пустой** |
| **BFF** | `reprintRollLabelBySeries` |
| **Модель** | `users.admin.models.machineLocationRollLabel` |

**Отправить:**

| Поле UI | Параметр BFF | Пример |
|:---|:---|:---|
| `selected_location_row.series_ref` | `series_ref` | `"002642110   2"` |
| оператор (опц.) | `operator_ref` | `"scr03-smoke"` |

**Не** передавать: `work_area_id`, `resource_id`, `barcode`, `material_roll_id`. Это **не** SCR-04.

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| открыть PDF | `result[0].report_preview_file_path` |
| статус | `result[0].report_make_succeeded`, `result[0].report_make_message` |
| шаблон | `result[0].template_code` → `LOCATION_ROLL_LABEL` |
| карточка preview | `result[0].nomenclature_name`, `current_length_m`, `barcode` |

**Запомнить:** последний `report_preview_file_path` для повторного открытия без нового вызова.

**Wire-пример:**

```json
{
  "error_code": "OK",
  "error_message": "",
  "result": [
    {
      "template_code": "LOCATION_ROLL_LABEL",
      "report_path": "users.admin.reports.mesInputLabel",
      "report_preview_file_path": "/admin/web/temp/20260625110837_MES_LOCATION_ROLL_LABEL.pdf",
      "report_make_succeeded": true,
      "report_make_message": "OK",
      "nomenclature_name": "BOPET CGPU 12 mc 1138 mm",
      "current_length_m": "690.500",
      "barcode": "002642110   2",
      "physical_print_enabled": false
    }
  ]
}
```

Preview-only (**CL-MAT-26**). Контракт: `anima-services/materials/scenarios/bff-machine-location-roll-label/contract_bff_location_roll_label_reprint.md`  
Live: `anima-services/materials/scenarios/bff-machine-location-roll-label/live_implementation.md` (R1)

---

### Момент R3 · Словарь причин блокировки (UI-24b, read)

| | |
|:---|:---|
| **Триггер** | `onMount` экрана (или первое открытие блока UI-24b) |
| **BFF** | `listBlockReasons` |
| **Модель** | `users.admin.models.machineMaterialBlock` |

**Отправить:** параметров нет.

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| select **Причина** | `result[]` → `reason_code` (value), `reason_label` (label) |

Коды live (**CL-MAT-11**): `BLOCK_CURING_VIOLATION`, `BLOCK_BROKEN_ROLLS`, `BLOCK_MATERIAL_DELAMINATION`, `BLOCK_UNEVEN_EDGE`, `BLOCK_WAVES`. У всех `source=STUB_V1`.

**Запомнить:** `block_reasons[]` — грузить один раз за сессию экрана.

Контракт: `anima-services/materials/scenarios/bff-machine-material-block/contract_bff_list_block_reasons.md`

---

### Момент R4 · «Передать блокировку» (UI-24b, write)

| | |
|:---|:---|
| **Триггер** | клик **«Передать блокировку»** |
| **Условие** | непустые `series_ref` и `reason_code` |
| **BFF** | `submitBlockRequest` |
| **Модель** | `users.admin.models.machineMaterialBlock` |

**Отправить:**

| Поле UI | Параметр BFF | Обяз. | Пример |
|:---|:---|:---:|:---|
| `selected_location_row.series_ref` | `series_ref` | да | `"002642110   2"` |
| `selected_reason_code` | `reason_code` | да | `"BLOCK_CURING_VIOLATION"` |
| `block_comment` | `comment` | нет | `""` |
| оператор | `operator_ref` | нет | `""` |

BFF передаёт в **1S** пару серия + причина; v1 live — stub `ACCEPTED`. Поля `blocked` в таблице обновятся **позже** репликацией из 1S/DWH — не менять локально без отдельного решения.

**Положить ответ:**

| Куда в UI | Откуда |
|:---|:---|
| toast / сообщение оператору | `result[0].display_message` |
| статус | `result[0].request_status` (`ACCEPTED`) |

**Ошибки:**

| Ситуация | `error_code` |
|:---|:---|
| пустая серия или причина | `INVALID_INPUT` |
| неизвестный код | `UNKNOWN_REASON_CODE` |

**Wire-пример:**

```json
{
  "error_code": "OK",
  "error_message": "",
  "result": [
    {
      "request_status": "ACCEPTED",
      "external_1s_ref": "STUB_1S_REF",
      "display_message": "Блокировка принята в 1S (stub). Остатки обновятся после репликации."
    }
  ]
}
```

Контракт: `anima-services/materials/scenarios/bff-machine-material-block/contract_bff_submit_block_request.md`  
Live: `anima-services/materials/scenarios/bff-machine-material-block/live_implementation.md` (R1)

---

## Сводка: кнопка → BFF

| Действие | UI-ID | BFF-функция (полный путь) | Заполняет |
|:---|:---:|:---|:---|
| Открытие / смена машины / **Обновить** | UI-23 | `users.admin.models.machineMaterialLocation.getMachineMaterialLocation` | таблица локации |
| **Печать этикетки** | UI-24a | `users.admin.models.machineLocationRollLabel.reprintRollLabelBySeries` | PDF preview |
| Загрузка причин (авто) | UI-24b | `users.admin.models.machineMaterialBlock.listBlockReasons` | select причин |
| **Передать блокировку** | UI-24b | `users.admin.models.machineMaterialBlock.submitBlockRequest` | toast статуса |

---

## Чеклист интеграции (правая колонка)

1. Location: таблица из `result[]`, машина из того же фильтра, что и левая колонка.
2. `resource_ids` на BFF не пустой; шлюз склеивает массив → CSV.
3. Фильтры вида (`include_*`) уходят в каждый вызов «Обновить».
4. Печать и блокировка — только при непустом `series_ref` выбранной строки.
5. `series_ref` — **без trim** лишних пробелов внутри строки.
6. Блокировка: `listBlockReasons` при старте; submit — только `series_ref` + `reason_code`.
7. После успешной блокировки — toast, таблицу location не «красить» локально.
8. Ошибки BFF — `error_message` оператору, `result` не читать.

---

# Приложение A. Песочница Expression Builder

**Зачем:** вручную повторить вызовы фронта на платформе до подключения шлюза.

**Где:** AggreGate `10.83.8.18:6460` → `MES` → `materialsPlatformService` → `frontMaterialsService` → модель → **Expression Builder**.

**Порядок** (как на экране):

```text
1. getMachineMaterialLocation   (Обновить)
2. reprintRollLabelBySeries     (серия из строки 1)
3. listBlockReasons             (словарь)
4. submitBlockRequest           (серия + причина)
```

### A.1 · Location — таблица (UI-23)

```text
callFunction(
  "users.admin.models.machineMaterialLocation",
  "getMachineMaterialLocation",
  "PR120",
  true,
  true,
  true,
  ""
)
```

Проверить: `error_code=OK`, **4 строки**; есть `Поддон 1200*800 б/у` с пустым `series_ref`; найти строку с непустым `series_ref` для шагов A.2 и A.4.

Только сырьё:

```text
callFunction(
  "users.admin.models.machineMaterialLocation",
  "getMachineMaterialLocation",
  "PR120",
  true,
  false,
  false,
  ""
)
```

Проверить: **2 строки**, виды Сырьё/ГП.

Только упаковка:

```text
callFunction(
  "users.admin.models.machineMaterialLocation",
  "getMachineMaterialLocation",
  "PR120",
  false,
  false,
  true,
  ""
)
```

Проверить: **2 строки**, вид Упаковка.

Ошибка — пустые машины:

```text
callFunction(
  "users.admin.models.machineMaterialLocation",
  "getMachineMaterialLocation",
  "",
  true,
  true,
  true,
  ""
)
```

Проверить: `error_code=INVALID_INPUT`.

### A.2 · Этикетка (UI-24a)

Серию скопировать из location **как есть** (пробелы значимы):

```text
callFunction(
  "users.admin.models.machineLocationRollLabel",
  "reprintRollLabelBySeries",
  "002642110   2",
  "scr03-smoke"
)
```

Проверить: `error_code=OK`, `template_code=LOCATION_ROLL_LABEL`, `report_preview_file_path` непустой, `nomenclature_name=BOPET CGPU 12 mc 1138 mm`.

Пустая серия:

```text
callFunction(
  "users.admin.models.machineLocationRollLabel",
  "reprintRollLabelBySeries",
  "",
  ""
)
```

Проверить: `INVALID_INPUT`.

### A.3 · Словарь причин (UI-24b)

```text
callFunction("users.admin.models.machineMaterialBlock", "listBlockReasons")
```

Проверить: `error_code=OK`, **5 строк**, у каждой `source=STUB_V1`.

### A.4 · Блокировка (UI-24b)

```text
callFunction(
  "users.admin.models.machineMaterialBlock",
  "submitBlockRequest",
  "002642110   2",
  "BLOCK_CURING_VIOLATION",
  "",
  ""
)
```

Проверить: `error_code=OK`, `request_status=ACCEPTED` (в первой строке `result`).

Пустая серия:

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

Неизвестная причина:

```text
callFunction(
  "users.admin.models.machineMaterialBlock",
  "submitBlockRequest",
  "002642110   2",
  "BLOCK_UNKNOWN",
  "",
  ""
)
```

Проверить: `UNKNOWN_REASON_CODE`.

---

## Ссылки

| Тема | Файл |
|:---|:---|
| Левая колонка | `export/SCR-03-material-order-bff-expression-builder-guide.md` |
| Паспорт SCR-03 | `core/printing_operator_ui/screens/SCR-03-material-order.md` |
| Location live | `anima-services/materials/scenarios/bff-machine-material-location/live_implementation.md` |
| Label live | `anima-services/materials/scenarios/bff-machine-location-roll-label/live_implementation.md` |
| Block live | `anima-services/materials/scenarios/bff-machine-material-block/live_implementation.md` |
| Smoke location | `tools/real-platform-live-connection/deploy_ui3_scr03_5_location_report.json` |
| Smoke label | `tools/real-platform-live-connection/deploy_ui3_scr03_6_location_roll_label_report.json` |
| Smoke block | `tools/real-platform-live-connection/deploy_ui3_scr03_7_block_report.json` |

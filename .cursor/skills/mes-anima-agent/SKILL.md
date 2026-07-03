---
name: mes-anima-agent
description: >
  Guides work in the mes-anima-app-base MES front-end (React, Vite, TypeScript, Tailwind,
  React Router data API, OpenAPI + React Query, MSW). Covers layers and public imports,
  routes and lazy pages, RPC-style JSON arrays and ServerDataPayload, operator UI
  (tables, modals, Informer), and eslint-plugin-boundaries. Use when implementing or
  refactoring features, pages, API clients, mocks, or shared UI in this repository.
---

# MES Anima — агент в этом репозитории

Короткие правила уже в **`.cursor/rules/*.mdc`** (они должны соблюдаться всегда). Этот skill задаёт **порядок действий** и напоминает точки входа в код.

## 1. Перед изменениями

1. Найти похожую фичу в `src/features/**` и повторить её паттерн (импорты, имена, разбиение `model` / `ui`).
2. Если трогаете контракт бэка — править YAML в `src/shared/api/schema/`, затем **`npm run api`** (не править `generated.ts` руками).
3. При новых путях API обновить MSW в `src/shared/api/mocks/handlers/**`, если моки включены в dev.

## 2. Слои и импорты

- **`src/app`** — роутер, провайдеры, склейка. Не тянуть «внутренности» фич отсюда кроме `*.page.tsx` и публичных `index`.
- **`src/features`** — страницы, UI и модель фич. Не импортировать `src/app`.
- **`src/shared`** — kit, API-инстансы, `lib`, конфиг. Не импортировать `features` / `app`.
- Импорт фич и shared — через **`index.ts` / `index.tsx`** (public API) или **`*.page.tsx`** для страниц.

Если меняется дерево папок под `src/**` — синхронизировать **`eslint.boundaries.js`**.

## 3. Роутинг и страницы

- Маршруты: **`src/app/router.tsx`**, пути — **`src/shared/model/routes.ts`**.
- Страница: `lazy: () => import("@/features/.../*.page")`, в модуле экспорт **`export const Component = ...`**.
- Разросшаяся страница — каталог **`feature-slug/model`** и **`feature-slug/ui`** (см. rule `feature-pages-decomposition`).

## 4. API и данные с бэка

- Тело запроса/ответа-массив по договорённости: **`body: []`** или **`body: [{ ... }]`**, не одиночный объект, если в схеме массив.
- **Поля в теле запроса** — **camelCase** в OpenAPI и клиенте (`workAreaId`, `resourceCode`, `startedBy`). Ответы `ServerDataPayload` с бэка часто snake_case — нормализуем в мапперах (см. rule `api-openapi-react-query.mdc`).
- Ответы-деревья **`ServerDataPayload` / `ServerDataRow`**: обход и хелперы — **`src/shared/lib/server-data-payload.ts`**.

## 5. UI: ui kit, таблицы, модалки, информация

- **Базовое правило**: интерфейс — из **`@/shared/ui/kit`** (см. rule **`ui-kit.mdc`**). Сначала kit и похожий экран в фиче, потом своя разметка.
- Таблицы: **`@/shared/ui/kit/table`**, оболочка и типографика ячеек — **`@/shared/ui/kit/styles/data-table-stack`** (эталон **`material-order-form-panel.tsx`**); компактные таблицы — **`OrderExecutionSimpleTable`** (`order-execution/ui/simple-table.tsx`). Рамка и скругление на **`Table`**, не на лишней обёртке.
- Заголовки блоков экрана и видимых модалок: **`sectionBlockTitleClassName`** / **`cnSectionBlockTitle`** — **`@/shared/ui/kit/styles/section-block-title`** (см. rule **`section-block-titles.mdc`**); **`DialogTitle`** в kit уже с этим стилем по умолчанию.
- Подписи полей комбобокса и нативного **`<select>`** (kit): **`comboboxFieldLabelClassName`** — **`@/shared/ui/kit/styles/combobox-field-label`** (см. **`combobox-field-labels.mdc`**; пример select — **`material-move-filters.tsx`**).
- Удаление строки в таблице: см. **`table-uikit.mdc`**; эталон — колонка удаления в **`material-order-form-panel.tsx`** (заказ материалов).
- Модалки фичи: только **`src/features/<segment>/<slug>/ui/modal/`**, примитив — **`@/shared/ui/kit/dialog`**.
- Плашки статуса / пояснения: **`Informer`** / **`InformerPill`** из kit (см. rules `informer-informational-blocks`, `table-uikit`).

## 6. Проверка

- После правок: **`npm run lint`** и при необходимости сборка / типы по принятому в проекте скрипту.

## Когда читать rule-файл целиком

| Тема | Rule |
|------|------|
| UI kit, примитивы `@/shared/ui/kit` | `ui-kit.mdc` |
| `ServerDataRow` / обход | `server-data-payload.mdc` |
| `createBrowserRouter`, `routes.ts`, `*.page.tsx` | `routing-pages.mdc` |
| Слои, `index.ts` | `architecture-layers.mdc` |
| OpenAPI, RQ, MSW, сессия | `api-openapi-react-query.mdc` |
| `eslint-plugin-boundaries` | `eslint-boundaries.mdc` |
| `ui/modal/`, Dialog, футер | `modals-ui-folder.mdc` |
| Informer vs кастомные цвета | `informer-informational-blocks.mdc` |
| Таблицы, `InformerPill` в ячейках | `table-uikit.mdc` |
| Заголовки блоков / модалок 12px Inter | `section-block-titles.mdc` |
| Подписи комбобокса / select 12px Inter regular | `combobox-field-labels.mdc` |
| Дробление страницы на `model` / `ui` | `feature-pages-decomposition.mdc` |

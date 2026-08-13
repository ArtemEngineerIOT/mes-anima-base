import { Button } from "@/shared/ui/kit/button";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Informer } from "@/shared/ui/kit/informer";
import { Switch } from "@/shared/ui/kit/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";
import { useDataTablePagination } from "@/shared/lib/data-table-pagination";
import { DataTablePaginationFooter } from "@/shared/ui/kit/data-table-pagination-footer";
import { DataTableViewport } from "@/shared/ui/kit/data-table-viewport";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import {
    dataTableBodyCellClassName,
    dataTableInsetShellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableSplitScrollBodyClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { MaterialOrderWorkspaceModel } from "../model/use-material-order-workspace";

type MaterialOrderFormPanelProps = {
    workspace: MaterialOrderWorkspaceModel;
};

const planStagesCheckboxColClass = "w-10 max-w-10 px-2";
const planStagesStageColClass = "w-20 max-w-20 whitespace-nowrap px-2";
const planStagesQuantityColClass = "w-16 max-w-16 whitespace-nowrap px-2";

const LOCAL_ACTION_ERROR_TITLES = new Set([
    "Выберите хотя бы один этап",
    "Сначала сформируйте заказ",
]);

function actionErrorSnackbar(message: string) {
    if (LOCAL_ACTION_ERROR_TITLES.has(message)) {
        return { title: message, description: undefined };
    }
    return { title: "Ошибка", description: message };
}

export function MaterialOrderFormPanel({ workspace }: MaterialOrderFormPanelProps) {
    const {
        orderMachineId,
        machineOptions,
        isMachineOptionsLoading,
        setOrderMachine,
        planStagesLoading,
        planStagesError,
        reloadPlanStages,
        planQuery,
        setPlanQuery,
        planRowsFiltered,
        planSelectedIds,
        togglePlanRow,
        isOrderFormVisible,
        composeError,
        dismissComposeError,
        isComposing,
        composeOrder,
        materialQuery,
        setMaterialQuery,
        materialLinesFiltered,
        materialChangeEnabled,
        setMaterialChangeEnabled,
        setLineQty,
        rollsQuery,
        setRollsQuery,
        rollsFiltered,
        pickToggleEnabled,
        specificRollsEnabled,
        handleSpecificRollsChange,
        rollsLoading,
        rollsError,
        dismissRollsError,
        selectedRollIds,
        toggleRoll,
        byTime,
        setByTime,
        warehouseComment,
        setWarehouseComment,
        clearMaterialSearch,
        resetOrderDraft,
        isAddingToOrder,
        addToOrder,
        isSubmitting,
        submitError,
        dismissSubmitError,
        submitOrder,
    } = workspace;

    const rollToggleDisabled = !pickToggleEnabled;
    const showRollPickBlock = pickToggleEnabled && specificRollsEnabled;

    const {
        pageItems: planPageItems,
        pagination: planPagination,
        pageSize: planPageSize,
        setPageSize: setPlanPageSize,
        setPage: setPlanPage,
    } = useDataTablePagination(planRowsFiltered, { initialPageSize: 5 });

    return (
        <>
        <div
            className={cn(
                "flex flex-col gap-4",
                isOrderFormVisible ? "min-h-0" : "min-h-0 flex-1",
            )}
        >
            <section
                className={cn(
                    "flex flex-col gap-2",
                    isOrderFormVisible ? "shrink-0" : "min-h-0 flex-1",
                )}
            >
                {planStagesError ? (
                    <Informer
                        tone="alert"
                        variant="filled"
                        size="s"
                        title="Не удалось загрузить этапы"
                        description={planStagesError}
                    />
                ) : null}
                <div className="flex items-end gap-2">
                    <div className="grid shrink-0 gap-1.5">
                        <Label htmlFor="material-order-machine" className={comboboxFieldLabelClassName}>
                            Машина
                        </Label>
                        <select
                            id="material-order-machine"
                            value={orderMachineId}
                            disabled={isMachineOptionsLoading || machineOptions.length === 0 || isOrderFormVisible}
                            onChange={(event) => setOrderMachine(event.target.value)}
                            className="h-9 w-[8.5rem] rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isMachineOptionsLoading ? <option value="">Загрузка…</option> : null}
                            {machineOptions.length === 0 ? <option value="">Нет машин</option> : null}
                            <option value="">Не выбрано</option>
                            {machineOptions.map((item) => (
                                <option key={item.resourceCode} value={item.resourceCode}>
                                    {item.machine}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                            <Icon
                                name="search"
                                className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg"
                            />
                            <Input
                                className="pl-9"
                                placeholder="Поиск по этапу, заказу, клиенту, продукту…"
                                value={planQuery}
                                onChange={(e) => setPlanQuery(e.target.value)}
                                aria-label="Поиск в таблице этапов"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="shrink-0"
                            onClick={() => setPlanQuery("")}
                            aria-label="Очистить поиск в таблице этапов"
                        >
                            <Icon name="delete_sweep" className="text-base" />
                        </Button>
                    </div>
                </div>
                <DataTableViewport
                    layout={isOrderFormVisible ? "fixed" : "fill"}
                    visibleBodyRows={5}
                    className={isOrderFormVisible ? "w-full" : "min-h-0 w-full flex-1"}
                    footer={
                        <DataTablePaginationFooter
                            totalCount={planPagination.totalCount}
                            rangeStart={planPagination.rangeStart}
                            rangeEnd={planPagination.rangeEnd}
                            page={planPagination.page}
                            totalPages={planPagination.totalPages}
                            pageSize={planPageSize}
                            onPageChange={setPlanPage}
                            onPageSizeChange={setPlanPageSize}
                        />
                    }
                >
                    <Table
                        className={cn(
                            dataTableInsetShellClassName,
                            "w-full border-separate border-spacing-0 text-[12px]",
                        )}
                    >
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead
                                    className={cn(
                                        dataTableStickyHeadCellClassName,
                                        planStagesCheckboxColClass,
                                    )}
                                    aria-label="Выбор"
                                />
                                <TableHead
                                    className={cn(
                                        dataTableStickyHeadCellClassName,
                                        planStagesStageColClass,
                                        "whitespace-nowrap",
                                    )}
                                >
                                    Этап
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "whitespace-nowrap")}>
                                    Дата заказа
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-0")}>
                                    Клиент
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-0 truncate")}>
                                    Продукт
                                </TableHead>
                                <TableHead
                                    className={cn(
                                        dataTableStickyHeadCellClassName,
                                        planStagesQuantityColClass,
                                    )}
                                >
                                    Кол-во
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "whitespace-nowrap")}>
                                    Старт
                                </TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "whitespace-nowrap")}>
                                    Завершение
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={dataTableSplitScrollBodyClassName}>
                            {planStagesLoading ? (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={8}
                                    >
                                        Загрузка этапов…
                                    </TableCell>
                                </TableRow>
                            ) : planRowsFiltered.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={8}
                                    >
                                        {!orderMachineId ? "Сначала выберите машину" : `Нет этапов плана для машины ${orderMachineId}`}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                planPageItems.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className={cn(dataTableBodyCellClassName, planStagesCheckboxColClass)}>
                                            <input
                                                type="checkbox"
                                                className="border-input size-4 rounded border"
                                                checked={planSelectedIds.has(row.id)}
                                                disabled={isOrderFormVisible}
                                                onChange={() => togglePlanRow(row.id)}
                                                aria-label={`Выбрать этап ${row.operationId}`}
                                            />
                                        </TableCell>
                                        <TableCell className={cn(dataTableBodyCellClassName, planStagesStageColClass)}>
                                            {row.operationId}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "whitespace-nowrap text-[11px]",
                                            )}
                                        >
                                            {row.orderDate}
                                        </TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, "min-w-0 truncate text-[11px]")}
                                            title={row.client}
                                        >
                                            {row.client}
                                        </TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, "min-w-0 truncate")}
                                            title={row.product}
                                        >
                                            {row.product}
                                        </TableCell>
                                        <TableCell
                                            className={cn(dataTableBodyCellClassName, planStagesQuantityColClass)}
                                        >
                                            {row.quantity}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "whitespace-nowrap text-[11px]",
                                            )}
                                        >
                                            {row.startAt}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                dataTableBodyCellClassName,
                                                "whitespace-nowrap text-[11px]",
                                            )}
                                        >
                                            {row.endAt}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </DataTableViewport>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {planStagesError ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void reloadPlanStages()}>
                            Повторить загрузку
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        pending={isComposing}
                        pendingLabel="Формирование…"
                        disabled={
                            planStagesLoading ||
                            isComposing ||
                            isOrderFormVisible ||
                            planSelectedIds.size === 0
                        }
                        onClick={() => {
                            void composeOrder();
                        }}
                    >
                        Сформировать заказ
                    </Button>
                </div>
            </section>

            {isOrderFormVisible ? (
                <>
                    <section className="border-border flex shrink-0 flex-col gap-2 border-t pt-2">
                <div className={cnSectionBlockTitle()}>Заказ материалов</div>
                <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                        <Icon
                            name="search"
                            className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg"
                        />
                        <Input
                            className="pl-9"
                            placeholder="Поиск по номенклатуре…"
                            value={materialQuery}
                            onChange={(e) => setMaterialQuery(e.target.value)}
                            aria-label="Поиск в заказе материалов"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="shrink-0"
                        onClick={clearMaterialSearch}
                        aria-label="Очистить поиск в заказе материалов"
                    >
                        <Icon name="delete_sweep" className="text-base" />
                    </Button>
                </div>
                <div className={dataTableScrollViewportClassName}>
                    <Table className={dataTableShellClassName}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[120px]")}>Код</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[200px]")}>Наименование</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[140px]")}>Запрошенное количество</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Единицы измерения</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materialLinesFiltered.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.nomenclatureName}</TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>
                                        <Input
                                            className="h-8"
                                            type="number"
                                            min={0}
                                            value={Number.isFinite(row.requestedQty) ? row.requestedQty : 0}
                                            onChange={(e) => {
                                                const n = Number(e.target.value);
                                                setLineQty(row.id, Number.isFinite(n) ? n : 0);
                                            }}
                                            aria-label={`Запрошенное количество для ${row.nomenclatureName || row.nomenclature}`}
                                        />
                                    </TableCell>
                                    <TableCell className={dataTableBodyCellClassName}>{row.quantityUom}</TableCell>
                                </TableRow>
                            ))}
                            {materialLinesFiltered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={4}
                                    >
                                        Нет позиций в заказе
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <label className="flex items-center gap-2 py-1">
                    <input
                        type="checkbox"
                        className="border-input size-4 rounded border"
                        checked={materialChangeEnabled}
                        onChange={(e) => setMaterialChangeEnabled(e.target.checked)}
                    />
                    <span className="text-sm">Смена материалов</span>
                </label>

                <div className="flex flex-wrap items-center justify-end gap-3 py-2">
                    <Label
                        htmlFor="material-order-specific-rolls"
                        className="text-muted-foreground cursor-pointer text-xs font-medium"
                    >
                        Заказать конкретные рулоны/серии
                    </Label>
                    <Switch
                        id="material-order-specific-rolls"
                        checked={specificRollsEnabled}
                        onCheckedChange={(checked) => {
                            void handleSpecificRollsChange(checked);
                        }}
                        disabled={rollToggleDisabled || rollsLoading}
                    />
                </div>

                {showRollPickBlock ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="relative min-w-0 flex-1">
                                <Icon
                                    name="search"
                                    className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-lg"
                                />
                                <Input
                                    className="pl-9"
                                    placeholder="Поиск рулонов…"
                                    value={rollsQuery}
                                    onChange={(e) => setRollsQuery(e.target.value)}
                                    aria-label="Поиск доступных рулонов"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="shrink-0"
                                onClick={() => setRollsQuery("")}
                                aria-label="Очистить поиск рулонов"
                            >
                                <Icon name="delete_sweep" className="text-base" />
                            </Button>
                        </div>
                        <div className={dataTableScrollViewportClassName}>
                            <Table className={dataTableShellClassName}>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} />
                                        <TableHead className={dataTableStickyHeadCellClassName}>Номенклатура</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Серия</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Количество</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Единицы измерения</TableHead>
                                        <TableHead className={dataTableStickyHeadCellClassName}>Срок годности</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rollsLoading ? (
                                        <TableRow>
                                            <TableCell
                                                className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                                colSpan={6}
                                            >
                                                Загрузка рулонов…
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rollsFiltered.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className={
                                                row.blocked
                                                    ? "!bg-destructive/15 hover:!bg-destructive/25 dark:!bg-destructive/20"
                                                    : undefined
                                            }
                                        >
                                            <TableCell className={dataTableBodyCellClassName}>
                                                <input
                                                    type="checkbox"
                                                    className="border-input size-4 rounded border"
                                                    checked={selectedRollIds.has(row.id)}
                                                    disabled={row.blocked}
                                                    onChange={() => toggleRoll(row.id)}
                                                    aria-label={`Выбрать рулон ${row.series}`}
                                                />
                                            </TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.nomenclature}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.series}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.availableQuantity}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.unit}</TableCell>
                                            <TableCell className={dataTableBodyCellClassName}>{row.expiresAt}</TableCell>
                                        </TableRow>
                                        ))
                                    )}
                                    {!rollsLoading && rollsFiltered.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                className={cn(dataTableBodyCellClassName, "py-6 text-center text-muted-foreground")}
                                                colSpan={6}
                                            >
                                                Нет рулонов по запросу
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                size="sm"
                                pending={isAddingToOrder}
                                pendingLabel="Проверка…"
                                disabled={isAddingToOrder || rollsLoading}
                                onClick={() => {
                                    void addToOrder();
                                }}
                            >
                                Добавить в заказ
                            </Button>
                        </div>
                    </div>
                ) : null}
            </section>

                    <section className="border-border flex shrink-0 flex-col gap-3 border-t pt-3">
                <div className="grid gap-2">
                    <Label htmlFor="material-order-by-time">Ко времени</Label>
                    <Input
                        id="material-order-by-time"
                        type="datetime-local"
                        value={byTime}
                        onChange={(e) => setByTime(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="material-order-wh-comment">Комментарий для склада</Label>
                    <textarea
                        id="material-order-wh-comment"
                        rows={3}
                        value={warehouseComment}
                        onChange={(e) => setWarehouseComment(e.target.value)}
                        placeholder="Текст для кладовщика…"
                        className={cn(
                            "border-input bg-background placeholder:text-muted-foreground min-h-[88px] w-full resize-y rounded-sm border px-3 py-2 text-sm shadow-xs outline-none",
                            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                    />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetOrderDraft}>
                        Очистить заявку
                    </Button>
                    <Button
                        type="button"
                        pending={isSubmitting}
                        pendingLabel="Отправка…"
                        disabled={isSubmitting}
                        onClick={() => {
                            void submitOrder();
                        }}
                    >
                        Отправить заявку
                    </Button>
                </div>
            </section>
                </>
            ) : null}
        </div>

            {composeError ? (
                <FloatingAutoDismissInformer
                    key={`compose-error:${composeError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title={actionErrorSnackbar(composeError).title}
                    description={actionErrorSnackbar(composeError).description}
                    onDismiss={dismissComposeError}
                />
            ) : null}
            {rollsError ? (
                <FloatingAutoDismissInformer
                    key={`rolls-error:${rollsError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка"
                    description={rollsError}
                    onDismiss={dismissRollsError}
                />
            ) : null}
            {submitError ? (
                <FloatingAutoDismissInformer
                    key={`submit-error:${submitError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title={actionErrorSnackbar(submitError).title}
                    description={actionErrorSnackbar(submitError).description}
                    onDismiss={dismissSubmitError}
                />
            ) : null}
        </>
    );
}

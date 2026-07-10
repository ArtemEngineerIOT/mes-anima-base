import { Button } from "@/shared/ui/kit/button";
import { Icon } from "@/shared/ui/kit/icon";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import { Informer } from "@/shared/ui/kit/informer";
import { Switch } from "@/shared/ui/kit/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { MaterialOrderWorkspaceModel } from "../model/use-material-order-workspace";

type MaterialOrderFormPanelProps = {
    workspace: MaterialOrderWorkspaceModel;
};

export function MaterialOrderFormPanel({ workspace }: MaterialOrderFormPanelProps) {
    const {
        orderMachineId,
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
        submitOrder,
    } = workspace;

    const rollToggleDisabled = !pickToggleEnabled;
    const showRollPickBlock = pickToggleEnabled && specificRollsEnabled;

    return (
        <div className="flex flex-col gap-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Вы заказываете к машине — {orderMachineId}
            </p>

            <section className="flex flex-col gap-2">
                {planStagesError ? (
                    <Informer
                        tone="alert"
                        variant="filled"
                        size="s"
                        title="Не удалось загрузить этапы"
                        description={planStagesError}
                    />
                ) : null}
                <div className="flex items-center gap-2">
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
                <div className={dataTableScrollViewportClassName}>
                    <Table className={dataTableShellClassName}>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-10")} />
                                <TableHead className={dataTableStickyHeadCellClassName}>Этап</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Дата заказа</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Клиент</TableHead>
                                <TableHead className={cn(dataTableStickyHeadCellClassName, "min-w-[180px]")}>Продукт</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Количество</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Старт</TableHead>
                                <TableHead className={dataTableStickyHeadCellClassName}>Завершение</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {planStagesLoading ? (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={8}
                                    >
                                        Загрузка этапов…
                                    </TableCell>
                                </TableRow>
                            ) : (
                                planRowsFiltered.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className={dataTableBodyCellClassName}>
                                            <input
                                                type="checkbox"
                                                className="border-input size-4 rounded border"
                                                checked={planSelectedIds.has(row.id)}
                                                disabled={isOrderFormVisible}
                                                onChange={() => togglePlanRow(row.id)}
                                                aria-label={`Выбрать этап ${row.stage}`}
                                            />
                                        </TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.stage}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.orderDate}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.client}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.product}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.quantity}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.startAt}</TableCell>
                                        <TableCell className={dataTableBodyCellClassName}>{row.endAt}</TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!planStagesLoading && planRowsFiltered.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        className={cn(dataTableBodyCellClassName, "py-8 text-center text-muted-foreground")}
                                        colSpan={8}
                                    >
                                        Нет этапов плана для машины {orderMachineId}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {composeError ? (
                        <div className="mr-auto text-[12px] text-destructive">{composeError}</div>
                    ) : null}
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
            <section className="border-border flex flex-col gap-2 border-t pt-2">
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
                        {rollsError ? (
                            <Informer
                                variant="bordered"
                                tone="alert"
                                size="s"
                                title="Не удалось загрузить рулоны"
                                description={rollsError}
                            />
                        ) : null}
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

            <section className="border-border flex flex-col gap-3 border-t pt-3">
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
                {submitError ? (
                    <p className="text-right text-[12px] text-destructive">{submitError}</p>
                ) : null}
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
    );
}

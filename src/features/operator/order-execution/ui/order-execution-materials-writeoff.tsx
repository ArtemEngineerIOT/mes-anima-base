import { useEffect } from "react";
import { useMaterialsWriteoff } from "@/features/operator/order-execution/model/materials-writeoff/use-materials-writeoff";
import { useOrderExecutionMachineStompState } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMaterialsWriteoffMachinePanel } from "@/features/operator/order-execution/model/machine-stomp/resolve-materials-writeoff-machine-panel";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { MaterialsWriteoffStageRegistry } from "@/features/operator/order-execution/ui/materials-writeoff-stage-registry";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import { cn } from "@/shared/lib/css";
import {
    dataTableBodyCellClassName,
    dataTableScrollViewportClassName,
    dataTableShellClassName,
    dataTableStickyHeadCellClassName,
} from "@/shared/ui/kit/styles/data-table-stack";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/kit/table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type OrderExecutionMaterialsWriteoffProps = {
    workAreaId?: string;
    enabled?: boolean;
};

export function OrderExecutionMaterialsWriteoff({ workAreaId, enabled = true }: OrderExecutionMaterialsWriteoffProps) {
    const machineStompState = useOrderExecutionMachineStompState();
    const machineDataPanel = resolveMaterialsWriteoffMachinePanel(machineStompState);
    const {
        barcode,
        setBarcode,
        data,
        isSearching,
        isPrefillLoading,
        prefillError,
        prefillHint,
        searchError,
        expandedOpId,
        setExpandedOpId,
        search,
        canSearch,
        writeoffForm,
        updateWriteoffForm,
        calculateWriteoffWeight,
        reflectMaterialReturn,
        writeOffMaterialFully,
        canCalculateWeight,
        isReflectReturnEnabled,
        isFullWriteoffEnabled,
        isWriteoffActionsEnabled,
        isReflectingReturn,
        isWritingOffFully,
        reflectReturnError,
        writeOffFullyError,
        warehouseOptions,
        isWriteoffWeightLoading,
        writeoffWeightError,
        showWriteoffFlow,
        stageRegistry,
    } = useMaterialsWriteoff({ workAreaId, enabled });

    useEffect(() => {
        if (!showWriteoffFlow || stageRegistry.isLoading) {
            return;
        }

        const firstExpandable = stageRegistry.stageOperations.find((op) => op.details);
        setExpandedOpId(firstExpandable?.id ?? null);
    }, [showWriteoffFlow, stageRegistry.isLoading, stageRegistry.stageOperations, setExpandedOpId]);

    const handleSearch = () => {
        void search();
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className={cnSectionBlockTitle("pb-2")}>Отсканируйте штрихкод серии</div>
                <div className="mt-2 flex items-center gap-2">
                    <Input
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                        placeholder="Результат сканирования штрихкода"
                        className="flex-1"
                        disabled={isSearching || isPrefillLoading}
                    />
                    <Button size="sm" onClick={handleSearch} disabled={!canSearch}>
                        {isPrefillLoading ? "Загрузка…" : isSearching ? "Поиск…" : "Найти"}
                    </Button>
                </div>
            </div>

            {prefillError && (
                <Informer
                    tone="alert"
                    variant="filled"
                    size="s"
                    title="Предзаполнение поля скана"
                    description={prefillError}
                />
            )}

            {prefillHint === "active" && (
                <Informer
                    tone="success"
                    variant="bordered"
                    size="s"
                    title="Активный входной рулон на этапе"
                    description="Рулон уже зарегистрирован на входе этапа. Ниже — актуальные данные по серии. Для обновления или регистрации другой серии отсканируйте штрихкод и нажмите «Найти»."
                />
            )}

            {prefillHint === "empty" && (
                <Informer
                    tone="normal"
                    variant="bordered"
                    size="s"
                    title="Активный входной рулон не найден"
                    description="На входе этапа нет зарегистрированного рулона. Отсканируйте штрихкод серии и нажмите «Найти», чтобы запустить рулон на этап."
                />
            )}

            {searchError && (
                <Informer tone="alert" variant="filled" size="s" title="Ошибка поиска" description={searchError} />
            )}

            {data && (
                <>
                    {data.stageSpecBannerVisible ? (
                        <Informer
                            tone="warning"
                            variant="filled"
                            title={data.stageSpecBannerTitle || "Внимание"}
                            description={data.stageSpecBannerDetail || undefined}
                        />
                    ) : (
                        data.seriesCard && (
                            <div className="space-y-2">
                                <div className={cnSectionBlockTitle("pb-2")}>Номенклатура по серии</div>
                                <div className={dataTableScrollViewportClassName}>
                                    <Table className={cn(dataTableShellClassName, "text-[12px]")}>
                                        <TableHeader className="bg-muted/40">
                                            <TableRow>
                                                <TableHead className={cn(dataTableStickyHeadCellClassName, "w-[45%]")}>
                                                    Характеристика
                                                </TableHead>
                                                <TableHead className={dataTableStickyHeadCellClassName}>Значение</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Номенклатура
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {data.seriesCard.nomenclatureName}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Код номенклатуры
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {data.seriesCard.nomenclatureCode}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Серия
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {data.seriesCard.seriesRef}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Единица измерения
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {data.seriesCard.quantityUom}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Метраж
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {String(data.seriesCard.currentLengthM)}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell
                                                    className={cn(dataTableBodyCellClassName, "text-muted-foreground")}
                                                >
                                                    Вес
                                                </TableCell>
                                                <TableCell className={dataTableBodyCellClassName}>
                                                    {String(data.seriesCard.currentWeightKg)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )
                    )}

                    {showWriteoffFlow && (
                        <>
                            <MachineDataPanel
                                rows={machineDataPanel.rows}
                                updatedAt={machineDataPanel.updatedAt}
                                tone={machineDataPanel.tone}
                            />
                            <MaterialsWriteoffStageRegistry
                                writeoffForm={writeoffForm}
                                warehouseOptions={warehouseOptions}
                                isWriteoffWeightLoading={isWriteoffWeightLoading}
                                writeoffWeightError={writeoffWeightError}
                                canCalculateWeight={canCalculateWeight}
                                isWriteoffActionsEnabled={isWriteoffActionsEnabled}
                                isReflectReturnEnabled={isReflectReturnEnabled}
                                isFullWriteoffEnabled={isFullWriteoffEnabled}
                                isReflectingReturn={isReflectingReturn}
                                isWritingOffFully={isWritingOffFully}
                                reflectReturnError={reflectReturnError}
                                writeOffFullyError={writeOffFullyError}
                                onCalculateWriteoffWeight={() => {
                                    void calculateWriteoffWeight();
                                }}
                                onReflectMaterialReturn={() => {
                                    void reflectMaterialReturn();
                                }}
                                onWriteOffMaterialFully={() => {
                                    void writeOffMaterialFully();
                                }}
                                stageOperations={stageRegistry.stageOperations}
                                isStageRegistryLoading={stageRegistry.isLoading}
                                stageRegistryError={stageRegistry.error}
                                stageRegistryAsOf={stageRegistry.asOf}
                                printError={stageRegistry.printError}
                                printingMaterialRollId={stageRegistry.printingMaterialRollId}
                                expandedOpId={expandedOpId}
                                onWriteoffFormChange={updateWriteoffForm}
                                onExpandedOpIdChange={setExpandedOpId}
                                onPrintReturnLabel={(materialRollId) => {
                                    void stageRegistry.printReturnLabel(materialRollId);
                                }}
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

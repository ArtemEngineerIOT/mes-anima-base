import { useEffect } from "react";
import { useMaterialsWriteoff } from "@/features/operator/order-execution/model/materials-writeoff/use-materials-writeoff";
import { useOrderExecutionMachineStompState } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
import { resolveMaterialsWriteoffMachinePanel } from "@/features/operator/order-execution/model/machine-stomp/resolve-materials-writeoff-machine-panel";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { MaterialsWriteoffFormPanel } from "@/features/operator/order-execution/ui/materials-writeoff-form-panel";
import { MaterialsWriteoffPresenceTable } from "@/features/operator/order-execution/ui/materials-writeoff-presence-table";
import { MaterialsWriteoffStageRegistry } from "@/features/operator/order-execution/ui/materials-writeoff-stage-registry";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Informer } from "@/shared/ui/kit/informer";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
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
        installationPlace,
        setInstallationPlace,
        installationPlaceOptions,
        presenceRows,
        isPresenceLoading,
        presenceAsOf,
        presenceError,
        expandedPresenceRowId,
        setExpandedPresenceRowId,
        selectedWriteoffRoll,
        scanBanner,
        isSearching,
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
        submitStageLkmWriteoff,
        moveToUnwind,
        movingToUnwindRowId,
        moveToUnwindError,
        selectForWriteoff,
        canCalculateWeight,
        isReflectReturnEnabled,
        isFullWriteoffEnabled,
        isWriteoffActionsEnabled,
        isReflectingReturn,
        isWritingOffFully,
        isSubmittingStageLkm,
        reflectReturnError,
        writeOffFullyError,
        submitStageLkmError,
        warehouseOptions,
        isWarehousesLoading,
        warehousesError,
        isWriteoffWeightLoading,
        writeoffWeightError,
        showWriteoffFlow,
        stageRegistry,
    } = useMaterialsWriteoff({ workAreaId, enabled });

    useEffect(() => {
        if (!enabled || stageRegistry.isLoading) {
            return;
        }

        const firstExpandable = stageRegistry.stageOperations.find((op) => op.details);
        setExpandedOpId(firstExpandable?.id ?? null);
    }, [enabled, stageRegistry.isLoading, stageRegistry.stageOperations, setExpandedOpId]);

    const handleSearch = () => {
        void search();
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className={cnSectionBlockTitle("pb-2")}>Отсканируйте штрихкод рулона</div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
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
                            className="w-full"
                            disabled={isSearching}
                        />
                    </div>
                    <div className="w-full sm:w-44">
                        <div className={comboboxFieldLabelClassName}>Место установки</div>
                        <select
                            className="mt-1 h-9 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            value={installationPlace}
                            onChange={(e) => setInstallationPlace(e.target.value as typeof installationPlace)}
                            disabled={isSearching}
                        >
                            {installationPlaceOptions.map((option) => (
                                <option key={option.value} value={option.value} disabled={option.disabled}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        size="sm"
                        className="shrink-0"
                        pending={isSearching}
                        pendingLabel="Регистрация…"
                        onClick={handleSearch}
                        disabled={!canSearch}
                    >
                        В машину
                    </Button>
                </div>
            </div>

            {searchError ? (
                <Informer tone="alert" variant="filled" size="s" title="Ошибка регистрации" description={searchError} />
            ) : null}

            {scanBanner?.stageSpecBannerVisible ? (
                <Informer
                    tone="warning"
                    variant="filled"
                    title={scanBanner.stageSpecBannerTitle || "Внимание"}
                    description={scanBanner.stageSpecBannerDetail || undefined}
                />
            ) : null}

            {presenceError ? (
                <Informer tone="alert" variant="filled" size="s" title="Рулоны в машине" description={presenceError} />
            ) : null}

            {moveToUnwindError ? (
                <Informer
                    tone="alert"
                    variant="filled"
                    size="s"
                    title="На размотку"
                    description={moveToUnwindError}
                />
            ) : null}

            <MaterialsWriteoffPresenceTable
                rows={presenceRows}
                isLoading={isPresenceLoading}
                presenceAsOf={presenceAsOf}
                expandedRowId={expandedPresenceRowId}
                movingToUnwindRowId={movingToUnwindRowId}
                selectedRowId={selectedWriteoffRoll?.id ?? null}
                onExpandedRowIdChange={setExpandedPresenceRowId}
                onMoveToUnwind={moveToUnwind}
                onSelectForWriteoff={selectForWriteoff}
            />

            {enabled ? (
                <MachineDataPanel
                    rows={machineDataPanel.rows}
                    updatedAt={machineDataPanel.updatedAt}
                    tone={machineDataPanel.tone}
                />
            ) : null}

            {enabled ? (
                <MaterialsWriteoffFormPanel
                    selectedNomenclature={selectedWriteoffRoll?.nomenclatureName ?? null}
                    writeoffForm={writeoffForm}
                    warehouseOptions={warehouseOptions}
                    isWarehousesLoading={isWarehousesLoading}
                    warehousesError={warehousesError}
                    isWriteoffWeightLoading={isWriteoffWeightLoading}
                    writeoffWeightError={writeoffWeightError}
                    canCalculateWeight={canCalculateWeight}
                    isWriteoffActionsEnabled={isWriteoffActionsEnabled}
                    isReflectReturnEnabled={isReflectReturnEnabled}
                    isFullWriteoffEnabled={isFullWriteoffEnabled}
                    isReflectingReturn={isReflectingReturn}
                    isWritingOffFully={isWritingOffFully}
                    isSubmittingStageLkm={isSubmittingStageLkm}
                    reflectReturnError={reflectReturnError}
                    writeOffFullyError={writeOffFullyError}
                    submitStageLkmError={submitStageLkmError}
                    isFormEnabled={showWriteoffFlow}
                    onCalculateWriteoffWeight={() => {
                        void calculateWriteoffWeight();
                    }}
                    onReflectMaterialReturn={() => {
                        void reflectMaterialReturn();
                    }}
                    onWriteOffMaterialFully={() => {
                        void writeOffMaterialFully();
                    }}
                    onSubmitStageLkmWriteoff={() => {
                        void submitStageLkmWriteoff();
                    }}
                    onWriteoffFormChange={updateWriteoffForm}
                />
            ) : null}

            <MaterialsWriteoffStageRegistry
                stageOperations={stageRegistry.stageOperations}
                isStageRegistryLoading={stageRegistry.isLoading}
                stageRegistryError={stageRegistry.error}
                stageRegistryAsOf={stageRegistry.asOf}
                printError={stageRegistry.printError}
                printingMaterialRollId={stageRegistry.printingMaterialRollId}
                expandedOpId={expandedOpId}
                onExpandedOpIdChange={setExpandedOpId}
                onPrintReturnLabel={(materialRollId) => {
                    void stageRegistry.printReturnLabel(materialRollId);
                }}
            />
        </div>
    );
}

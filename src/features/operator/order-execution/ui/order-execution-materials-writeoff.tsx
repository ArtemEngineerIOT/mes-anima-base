import { useMemo } from "react";
import { useMaterialsWriteoff } from "@/features/operator/order-execution/model/materials-writeoff/use-materials-writeoff";
import { useMaterialsWriteoffRawEvent } from "@/features/operator/order-execution/model/materials-writeoff/use-materials-writeoff-raw-event";
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
    onMonitoringSummaryReload?: () => void;
};

export function OrderExecutionMaterialsWriteoff({
    workAreaId,
    enabled = true,
    onMonitoringSummaryReload,
}: OrderExecutionMaterialsWriteoffProps) {
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
        expandedOpIds,
        toggleExpandedOpId,
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
        applyRawEventPrefill,
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
        refreshWriteoffTables,
    } = useMaterialsWriteoff({ workAreaId, enabled, onMonitoringSummaryReload });

    const {
        rawEvent,
        rows: rawEventRows,
        isLoading: isRawEventLoading,
        error: rawEventError,
        discardEventRoll,
        isDiscarding,
        discardError,
        acceptRawFromEvent,
        isAccepting,
        acceptError,
    } = useMaterialsWriteoffRawEvent({
        workAreaId,
        enabled,
        onAcceptPrefill: applyRawEventPrefill,
        onResolved: refreshWriteoffTables,
    });

    const rawEventPanelTitle = useMemo(() => {
        if (!rawEvent.currentEvent) {
            return rawEvent.plateTitle || "Событие с машины";
        }

        return (
            [rawEvent.plateTitle, rawEvent.currentEvent.eventCodeLabel].filter(Boolean).join(" · ") ||
            "Событие с машины"
        );
    }, [rawEvent.currentEvent, rawEvent.plateTitle]);

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

            {rawEventError ? (
                <Informer
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Событие с машины"
                    description={rawEventError}
                />
            ) : null}

            {enabled && !isRawEventLoading && !rawEventError && rawEvent.currentEvent ? (
                <MachineDataPanel
                    title={rawEventPanelTitle}
                    rows={rawEventRows}
                    tone="warning"
                    updatedAt={rawEvent.currentEvent.eventAt || null}
                    updatedAtLabel="Зарегистрировано от"
                    emptyText="Нет характеристик события"
                    footer={
                        <div className="flex flex-col items-end gap-2">
                            {acceptError || discardError ? (
                                <div className="w-full text-[12px] text-destructive">
                                    {acceptError || discardError}
                                </div>
                            ) : null}
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    pending={isAccepting}
                                    pendingLabel="Регистрация…"
                                    disabled={isDiscarding || isAccepting}
                                    onClick={() => {
                                        void acceptRawFromEvent();
                                    }}
                                >
                                    Зарегистрировать
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    pending={isDiscarding}
                                    pendingLabel="Отклонение…"
                                    disabled={isDiscarding || isAccepting}
                                    onClick={() => {
                                        void discardEventRoll();
                                    }}
                                >
                                    Отклонить
                                </Button>
                            </div>
                        </div>
                    }
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
                expandedOpIds={expandedOpIds}
                onToggleExpandedOpId={toggleExpandedOpId}
                onPrintReturnLabel={(materialRollId) => {
                    void stageRegistry.printReturnLabel(materialRollId);
                }}
            />
        </div>
    );
}

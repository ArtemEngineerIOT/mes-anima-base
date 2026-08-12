import { useEffect, useMemo, type MutableRefObject } from "react";
import { useMaterialsWriteoff } from "@/features/operator/order-execution/model/materials-writeoff/use-materials-writeoff";
import { useListMaterialSignals } from "@/features/operator/order-execution/model/materials-writeoff/use-list-material-signals";
import type { RollWriteOffEventsSummarySnapshot } from "@/features/operator/order-execution/model/materials-writeoff/raw-events-summary/types";
import { getReleaseProductionEventCellValue } from "@/features/operator/order-execution/model/release/map-event-release-production-payload";
import { resolveMachineStompPanelTone } from "@/features/operator/order-execution/model/machine-stomp/resolve-machine-stomp-panel-tone";
import { useOrderExecutionMachineStompState } from "@/features/operator/order-execution/model/machine-stomp/order-execution-machine-stomp-context";
import { FloatingAutoDismissInformer } from "@/shared/ui/kit/floating-auto-dismiss-informer";
import { MachineDataPanel } from "@/shared/ui/kit/machine-data-panel";
import { MaterialsWriteoffFormPanel } from "@/features/operator/order-execution/ui/materials-writeoff-form-panel";
import { MaterialsWriteoffPresenceTable } from "@/features/operator/order-execution/ui/materials-writeoff-presence-table";
import { MaterialsWriteoffStageRegistry } from "@/features/operator/order-execution/ui/materials-writeoff-stage-registry";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

type OrderExecutionMaterialsWriteoffProps = {
    workAreaId?: string;
    enabled?: boolean;
    eventsSummary?: RollWriteOffEventsSummarySnapshot | null;
    onMonitoringSummaryReload?: () => void;
    /** Регистрирует silent-reload таблицы необработанных сигналов списания */
    materialSignalsSilentReloadRef?: MutableRefObject<(() => void) | null>;
};

export function OrderExecutionMaterialsWriteoff({
    workAreaId,
    enabled = true,
    eventsSummary = null,
    onMonitoringSummaryReload,
    materialSignalsSilentReloadRef,
}: OrderExecutionMaterialsWriteoffProps) {
    const machineStompState = useOrderExecutionMachineStompState();
    const {
        signalList,
        emptyStateMessage: signalsEmptyStateMessage,
        isLoading: isSignalsLoading,
        error: signalsError,
        selectedSignalId,
        toggleSignalSelection,
        reloadSilent: reloadMaterialSignalsSilent,
    } = useListMaterialSignals({ workAreaId, enabled });

    useEffect(() => {
        if (!materialSignalsSilentReloadRef) {
            return;
        }

        materialSignalsSilentReloadRef.current = () => {
            reloadMaterialSignalsSilent();
        };

        return () => {
            materialSignalsSilentReloadRef.current = null;
        };
    }, [materialSignalsSilentReloadRef, reloadMaterialSignalsSilent]);

    const selectedSignalLengthM = useMemo(() => {
        if (!selectedSignalId) {
            return null;
        }

        const row = signalList.find((item) => item.id === selectedSignalId);
        if (!row) {
            return null;
        }

        return getReleaseProductionEventCellValue(row, "length_m");
    }, [selectedSignalId, signalList]);

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
        dismissPresenceError,
        dismissScanBanner,
        dismissSearchError,
        dismissMoveToUnwindError,
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
        applySignalLengthPrefill,
        clearSignalLengthPrefill,
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
        formPanelMessage,
        dismissFormPanelMessage,
        warehouseOptions,
        isWarehousesLoading,
        warehousesError,
        isWriteoffWeightLoading,
        showWriteoffFlow,
        stageRegistry,
    } = useMaterialsWriteoff({
        workAreaId,
        enabled,
        signalId: selectedSignalId,
        signalLengthM: selectedSignalLengthM,
        onMonitoringSummaryReload,
    });

    const handleToggleSignal = (rowId: string) => {
        const willSelect = selectedSignalId !== rowId;
        toggleSignalSelection(rowId);

        if (willSelect) {
            const row = signalList.find((item) => item.id === rowId);
            const lengthM = row ? getReleaseProductionEventCellValue(row, "length_m") : null;
            applySignalLengthPrefill(lengthM);
            return;
        }

        clearSignalLengthPrefill();
    };

    const eventsSummaryRows = useMemo(
        () =>
            eventsSummary?.fields.map((field) => ({
                characteristic: field.label,
                value: String(field.value),
                unit: "",
            })) ?? [],
        [eventsSummary?.fields],
    );

    const eventsSummaryTone = resolveMachineStompPanelTone(machineStompState);

    /** Плашка и комбобокс сигналов — только если есть необработанные сигналы с машины */
    const hasMachineSignals =
        signalList.length > 0 || (eventsSummary?.unprocessedCount ?? 0) > 0;

    const handleSearch = () => {
        void search();
    };

    return (
        <div className="flex flex-col gap-4">
            {enabled && hasMachineSignals ? (
                <MachineDataPanel
                    title="Данные с машин"
                    rows={eventsSummaryRows}
                    tone={eventsSummaryTone}
                    emptyText="Нет данных сводки"
                    updatedAt={eventsSummary?.changedAt}
                    updatedAtLabel="Обновлено"
                    showUnitColumn={false}
                />
            ) : null}

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
                            className="h-8 w-full"
                            disabled={isSearching}
                        />
                    </div>
                    <div className="w-full sm:w-44">
                        <div className={comboboxFieldLabelClassName}>Место установки</div>
                        <select
                            className="mt-1 h-8 w-full rounded-sm border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
                <FloatingAutoDismissInformer
                    key={`search-error:${searchError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Ошибка регистрации"
                    description={searchError}
                    onDismiss={dismissSearchError}
                />
            ) : null}

            {scanBanner?.stageSpecBannerVisible ? (
                <FloatingAutoDismissInformer
                    key={`scan-banner:${scanBanner.stageSpecBannerTitle}:${scanBanner.stageSpecBannerDetail}`}
                    tone="warning"
                    variant="bordered"
                    size="s"
                    title={scanBanner.stageSpecBannerTitle || "Внимание"}
                    description={scanBanner.stageSpecBannerDetail || undefined}
                    onDismiss={dismissScanBanner}
                />
            ) : null}

            {presenceError ? (
                <FloatingAutoDismissInformer
                    key={`presence-error:${presenceError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="Рулоны в машине"
                    description={presenceError}
                    onDismiss={dismissPresenceError}
                />
            ) : null}

            {moveToUnwindError ? (
                <FloatingAutoDismissInformer
                    key={`move-to-unwind:${moveToUnwindError}`}
                    tone="alert"
                    variant="bordered"
                    size="s"
                    title="На размотку"
                    description={moveToUnwindError}
                    onDismiss={dismissMoveToUnwindError}
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
                <MaterialsWriteoffFormPanel
                    selectedNomenclature={selectedWriteoffRoll?.nomenclatureName ?? null}
                    writeoffForm={writeoffForm}
                    warehouseOptions={warehouseOptions}
                    isWarehousesLoading={isWarehousesLoading}
                    warehousesError={warehousesError}
                    isWriteoffWeightLoading={isWriteoffWeightLoading}
                    canCalculateWeight={canCalculateWeight}
                    isWriteoffActionsEnabled={isWriteoffActionsEnabled}
                    isReflectReturnEnabled={isReflectReturnEnabled}
                    isFullWriteoffEnabled={isFullWriteoffEnabled}
                    isReflectingReturn={isReflectingReturn}
                    isWritingOffFully={isWritingOffFully}
                    isSubmittingStageLkm={isSubmittingStageLkm}
                    formPanelMessage={formPanelMessage}
                    onDismissFormPanelMessage={dismissFormPanelMessage}
                    isFormEnabled={showWriteoffFlow}
                    signalList={signalList}
                    signalsEmptyStateMessage={signalsEmptyStateMessage}
                    isSignalsLoading={isSignalsLoading}
                    signalsError={signalsError}
                    selectedSignalId={selectedSignalId}
                    onToggleSignal={handleToggleSignal}
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mapProductionPlanMachinesPayload } from "@/features/operator/production-plan/model/map-production-plan-machines-payload";
import type { ProductionPlanMachine } from "@/features/operator/production-plan/model/types";
import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";

import {
    buildDefectWeighingScaleOptions,
    DEFECT_WEIGHING_ALL_EVENT_CODES,
    DEFECT_WEIGHING_DEFAULT_RESOURCE_CODE,
    DEFECT_WEIGHING_MOCK_SCALE_WEIGHT_KG,
    DEFECT_WEIGHING_POPULAR_EVENT_CODES,
} from "./constants";
import { MOCK_DEFECT_WEIGHING_JOURNAL } from "./defect-weighing-mock";
import { mapDefectWeighingPlanStagesPayload } from "./map-defect-weighing-plan-stages-payload";
import type { DefectWeighingFormState, DefectWeighingJournalRow, DefectWeighingStage } from "./types";

function normalizeSearch(q: string) {
    return q.trim().toLowerCase();
}

function stageMatchesSearch(row: DefectWeighingStage, q: string) {
    if (!q) {
        return true;
    }

    const normalized = normalizeSearch(q);
    return (
        row.stage.toLowerCase().includes(normalized) ||
        row.orderId.toLowerCase().includes(normalized) ||
        row.client.toLowerCase().includes(normalized) ||
        row.product.toLowerCase().includes(normalized)
    );
}

function parseStageDate(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—") {
        return null;
    }

    const parsed = Date.parse(trimmed.replace(" ", "T"));
    return Number.isNaN(parsed) ? null : parsed;
}

function stageOverlapsPeriod(row: DefectWeighingStage, dateFrom: string, dateTo: string): boolean {
    if (!dateFrom && !dateTo) {
        return true;
    }

    const fromMs = dateFrom ? Date.parse(`${dateFrom}T00:00:00`) : null;
    const toMs = dateTo ? Date.parse(`${dateTo}T23:59:59`) : null;
    const startMs = parseStageDate(row.startAt);
    const endMs = parseStageDate(row.endAt) ?? startMs;

    if (fromMs != null && endMs != null && endMs < fromMs) {
        return false;
    }
    if (toMs != null && startMs != null && startMs > toMs) {
        return false;
    }

    return true;
}

function formatJournalTimestamp(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function defaultDateRange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const toIso = (date: Date) => date.toISOString().slice(0, 10);
    return { dateFrom: toIso(from), dateTo: toIso(to) };
}

const initialDateRange = defaultDateRange();

export function useDefectWeighing() {
    const [machineOptions, setMachineOptions] = useState<ProductionPlanMachine[]>([]);
    const [machinesLoading, setMachinesLoading] = useState(true);
    const [machinesError, setMachinesError] = useState<string | null>(null);

    const [resourceCode, setResourceCode] = useState(DEFECT_WEIGHING_DEFAULT_RESOURCE_CODE);
    const [dateFrom, setDateFrom] = useState(initialDateRange.dateFrom);
    const [dateTo, setDateTo] = useState(initialDateRange.dateTo);

    const [stages, setStages] = useState<DefectWeighingStage[]>([]);
    const [stagesLoading, setStagesLoading] = useState(false);
    const [stagesError, setStagesError] = useState<string | null>(null);
    const [stageQuery, setStageQuery] = useState("");
    const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

    const [journal, setJournal] = useState<DefectWeighingJournalRow[]>(() => [...MOCK_DEFECT_WEIGHING_JOURNAL]);
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const scaleOptions = useMemo(() => buildDefectWeighingScaleOptions(resourceCode), [resourceCode]);

    const [form, setForm] = useState<DefectWeighingFormState>(() => ({
        scaleId: buildDefectWeighingScaleOptions(DEFECT_WEIGHING_DEFAULT_RESOURCE_CODE)[0]?.id ?? "",
        weightKg: DEFECT_WEIGHING_MOCK_SCALE_WEIGHT_KG,
        eventCode: DEFECT_WEIGHING_POPULAR_EVENT_CODES[0]?.code ?? "",
        note: "",
    }));

    const { mutateAsync: fetchProductionPlanMachines } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionPlanMachines,
        {},
    );
    const { mutateAsync: fetchPlanStages } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getMaterialOrderPlanStages,
        {},
    );

    const fetchProductionPlanMachinesRef = useRef(fetchProductionPlanMachines);
    fetchProductionPlanMachinesRef.current = fetchProductionPlanMachines;
    const fetchPlanStagesRef = useRef(fetchPlanStages);
    fetchPlanStagesRef.current = fetchPlanStages;

    const loadMachines = useCallback(async () => {
        setMachinesLoading(true);
        setMachinesError(null);

        try {
            const payload = await fetchProductionPlanMachinesRef.current({ body: [] });
            const options = mapProductionPlanMachinesPayload(payload);
            setMachineOptions(options);

            const preferred = options.find((item) => item.resourceCode === DEFECT_WEIGHING_DEFAULT_RESOURCE_CODE);
            if (preferred) {
                setResourceCode(preferred.resourceCode);
            } else if (options[0]) {
                setResourceCode(options[0].resourceCode);
            }
        } catch (loadError) {
            setMachineOptions([]);
            setMachinesError(loadError instanceof Error ? loadError.message : "Не удалось загрузить машины");
        } finally {
            setMachinesLoading(false);
        }
    }, []);

    const loadStages = useCallback(async () => {
        const trimmedResourceCode = resourceCode.trim();
        if (!trimmedResourceCode) {
            setStages([]);
            setSelectedStageId(null);
            return;
        }

        setStagesLoading(true);
        setStagesError(null);

        try {
            const payload = await fetchPlanStagesRef.current({
                body: [{ resourceCode: trimmedResourceCode }],
            });
            const mapped = mapDefectWeighingPlanStagesPayload(payload);
            setStages(mapped);
            setSelectedStageId((prev) => (prev && mapped.some((row) => row.id === prev) ? prev : (mapped[0]?.id ?? null)));
        } catch (loadError) {
            setStages([]);
            setSelectedStageId(null);
            setStagesError(loadError instanceof Error ? loadError.message : "Не удалось загрузить этапы");
        } finally {
            setStagesLoading(false);
        }
    }, [resourceCode]);

    useEffect(() => {
        void loadMachines();
    }, [loadMachines]);

    useEffect(() => {
        void loadStages();
    }, [loadStages]);

    useEffect(() => {
        const nextScaleOptions = buildDefectWeighingScaleOptions(resourceCode);
        const nextScaleId = nextScaleOptions[0]?.id ?? "";
        setForm((prev) => ({
            ...prev,
            scaleId: nextScaleOptions.some((option) => option.id === prev.scaleId) ? prev.scaleId : nextScaleId,
            weightKg: DEFECT_WEIGHING_MOCK_SCALE_WEIGHT_KG,
        }));
    }, [resourceCode]);

    const filteredStages = useMemo(() => {
        const query = normalizeSearch(stageQuery);
        return stages.filter(
            (row) => stageMatchesSearch(row, query) && stageOverlapsPeriod(row, dateFrom, dateTo),
        );
    }, [dateFrom, dateTo, stageQuery, stages]);

    useEffect(() => {
        if (filteredStages.length === 0) {
            setSelectedStageId(null);
            return;
        }

        setSelectedStageId((prev) =>
            prev && filteredStages.some((row) => row.id === prev) ? prev : (filteredStages[0]?.id ?? null),
        );
    }, [filteredStages]);

    const selectedStage = useMemo(
        () => filteredStages.find((row) => row.id === selectedStageId) ?? null,
        [filteredStages, selectedStageId],
    );

    const patchForm = useCallback((patch: Partial<DefectWeighingFormState>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    }, []);

    const selectPopularDefect = useCallback((eventCode: string) => {
        setForm((prev) => ({ ...prev, eventCode }));
    }, []);

    const registerDefect = useCallback(async () => {
        setRegisterError(null);

        if (!selectedStage) {
            setRegisterError("Выберите этап для регистрации брака");
            return;
        }

        const weight = Number(form.weightKg.replace(",", "."));
        if (!Number.isFinite(weight) || weight <= 0) {
            setRegisterError("Укажите вес брака больше нуля");
            return;
        }

        const event = DEFECT_WEIGHING_ALL_EVENT_CODES.find((item) => item.code === form.eventCode);
        if (!event) {
            setRegisterError("Выберите тип брака");
            return;
        }

        setIsRegistering(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));

            const entry: DefectWeighingJournalRow = {
                id: `j-${Date.now()}`,
                stageLabel: selectedStage.orderId,
                registeredAt: formatJournalTimestamp(new Date()),
                weightKg: weight,
                defectLabel: event.label,
                note: form.note.trim(),
            };

            setJournal((prev) => [entry, ...prev]);
            setForm((prev) => ({
                ...prev,
                weightKg: DEFECT_WEIGHING_MOCK_SCALE_WEIGHT_KG,
                note: "",
            }));
        } catch {
            setRegisterError("Не удалось зарегистрировать брак");
        } finally {
            setIsRegistering(false);
        }
    }, [form.eventCode, form.note, form.weightKg, selectedStage]);

    const canRegister =
        Boolean(selectedStage) &&
        Number(form.weightKg.replace(",", ".")) > 0 &&
        Boolean(form.eventCode) &&
        !isRegistering;

    return {
        machineOptions,
        machinesLoading,
        machinesError,
        resourceCode,
        setResourceCode,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        stagesLoading,
        stagesError,
        reloadStages: loadStages,
        stageQuery,
        setStageQuery,
        filteredStages,
        selectedStageId,
        setSelectedStageId,
        selectedStage,
        scaleOptions,
        form,
        patchForm,
        selectPopularDefect,
        popularEventCodes: DEFECT_WEIGHING_POPULAR_EVENT_CODES,
        allEventCodes: DEFECT_WEIGHING_ALL_EVENT_CODES,
        journal,
        registerDefect,
        registerError,
        isRegistering,
        canRegister,
    };
}

export type DefectWeighingModel = ReturnType<typeof useDefectWeighing>;

import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";
import { mapProductionPlanMachinesPayload } from "@/features/operator/production-plan/model/map-production-plan-machines-payload";
import type { ProductionPlanMachine } from "@/features/operator/production-plan/model/types";

import {
    mapOrderExecutionPayload,
    mergeOrderExecutionMachineData,
} from "./map-order-execution-payload";
import {
    buildOrderExecutionEmptyMachine,
    ORDER_EXECUTION_MOCK,
} from "./mock-order-execution";
import type { MachineData } from "./types";

/** Пока фиксированный код машины оператора (далее — из профиля MES). */
const ORDER_EXECUTION_DEFAULT_RESOURCE_CODE = "PR120";

function isResourceAllowed(resourceCode: string, allowedResourceCodes: string[]): boolean {
    if (allowedResourceCodes.length === 0) {
        return true;
    }

    const allowedCodes = new Set(
        allowedResourceCodes.map((code) => code.trim().toUpperCase()).filter(Boolean),
    );
    return allowedCodes.has(resourceCode.toUpperCase());
}

function pickDefaultMachineByAllowedResources(
    options: ProductionPlanMachine[],
    allowedResourceCodes: string[],
): string | null {
    if (options.length === 0) {
        return null;
    }

    const preferred = options.find(
        (item) =>
            item.resourceCode === ORDER_EXECUTION_DEFAULT_RESOURCE_CODE &&
            isResourceAllowed(item.resourceCode, allowedResourceCodes),
    );
    if (preferred) {
        return preferred.resourceCode;
    }

    for (const code of allowedResourceCodes) {
        const trimmed = code.trim();
        const match = options.find((item) => item.resourceCode === trimmed);
        if (trimmed && match && isResourceAllowed(match.resourceCode, allowedResourceCodes)) {
            return match.resourceCode;
        }
    }

    const firstAllowed = options.find((item) => isResourceAllowed(item.resourceCode, allowedResourceCodes));
    return firstAllowed?.resourceCode ?? options[0]?.resourceCode ?? null;
}

export function useOrderExecution(mockMachines: MachineData[] = ORDER_EXECUTION_MOCK) {
    const { session, isBootstrapLoading } = useSession();
    const [machineOptions, setMachineOptions] = useState<ProductionPlanMachine[]>([]);
    const [isMachineOptionsLoading, setIsMachineOptionsLoading] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
    const [current, setCurrent] = useState<MachineData>(() => buildOrderExecutionEmptyMachine("—"));
    const [isMachineDataLoading, setIsMachineDataLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const mockMachinesRef = useRef(mockMachines);
    mockMachinesRef.current = mockMachines;

    const allowedResourceCodes = session?.mesBootstrap?.resourceRights.allowedResourceCodes ?? [];
    const allowedResourceCodesRef = useRef(allowedResourceCodes);
    allowedResourceCodesRef.current = allowedResourceCodes;

    const { mutateAsync: fetchProductionPlanMachines } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getProductionPlanMachines,
        {},
    );

    const { mutateAsync: fetchOrderExecution } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.getOrderExecution,
        {},
    );

    const fetchProductionPlanMachinesRef = useRef(fetchProductionPlanMachines);
    fetchProductionPlanMachinesRef.current = fetchProductionPlanMachines;

    const fetchOrderExecutionRef = useRef(fetchOrderExecution);
    fetchOrderExecutionRef.current = fetchOrderExecution;

    const loadMachineOptions = useCallback(async () => {
        setIsMachineOptionsLoading(true);
        try {
            const payload = await fetchProductionPlanMachinesRef.current({ body: [] });
            const options = mapProductionPlanMachinesPayload(payload);
            setMachineOptions(options);
            setSelectedMachine((prev) => {
                if (prev && options.some((item) => item.resourceCode === prev)) {
                    return prev;
                }
                return pickDefaultMachineByAllowedResources(options, allowedResourceCodesRef.current);
            });
        } catch {
            setMachineOptions([]);
            setSelectedMachine(null);
        } finally {
            setIsMachineOptionsLoading(false);
        }
    }, []);

    const loadMachineContext = useCallback(async (resourceCode: string) => {
        setIsMachineDataLoading(true);
        setFetchError(null);

        try {
            const payload = await fetchOrderExecutionRef.current({
                body: [{ resourceCode }],
            });
            const mapped = mapOrderExecutionPayload(payload, resourceCode);
            const mockFallback = mockMachinesRef.current.find(
                (machine) => machine.machineId.toUpperCase() === resourceCode.toUpperCase(),
            );
            setCurrent(mergeOrderExecutionMachineData(mapped, mockFallback));
        } catch (error) {
            setCurrent(buildOrderExecutionEmptyMachine(resourceCode));
            setFetchError(
                error instanceof Error ? error.message : "Не удалось загрузить данные по машине",
            );
        } finally {
            setIsMachineDataLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isBootstrapLoading) {
            return;
        }

        void loadMachineOptions();
    }, [isBootstrapLoading, loadMachineOptions]);

    useEffect(() => {
        if (!selectedMachine) {
            setCurrent(buildOrderExecutionEmptyMachine("—"));
            return;
        }

        void loadMachineContext(selectedMachine);
    }, [loadMachineContext, selectedMachine]);

    return {
        machineOptions,
        isMachineOptionsLoading,
        isMachineDataLoading,
        selectedMachine,
        setSelectedMachine,
        current,
        fetchError,
    };
}

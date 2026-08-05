import { useCallback, useEffect, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription } from "@/shared/api/websocket";

import { mapProductionEventsSummaryPayload } from "./map-production-events-summary-payload";
import {
    RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS,
    type ReleaseProductionEventsSummarySnapshot,
} from "./types";

type LoadOptions = {
    silent?: boolean;
};

type UseProductionEventsSummaryOptions = {
    workAreaId?: string;
    /** Запрос getEventsSummary — только когда блок «Выпуск» раскрыт */
    enabled?: boolean;
    /** После STOMP — silent-reload мониторинга / прогресса этапа */
    onRelatedDataReload?: () => void;
};

export function useProductionEventsSummary({
    workAreaId,
    enabled = true,
    onRelatedDataReload,
}: UseProductionEventsSummaryOptions) {
    const [snapshot, setSnapshot] = useState<ReleaseProductionEventsSummarySnapshot>(
        RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: fetchSummary } = rqClient.useMutation("post", REST_FUNCTION_PATHS.getEventsSummary, {});

    const fetchSummaryRef = useRef(fetchSummary);
    fetchSummaryRef.current = fetchSummary;
    const onRelatedDataReloadRef = useRef(onRelatedDataReload);
    onRelatedDataReloadRef.current = onRelatedDataReload;
    const enabledRef = useRef(enabled);
    enabledRef.current = enabled;

    const resetState = useCallback(() => {
        setSnapshot(RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY);
        setError(null);
        setIsLoading(false);
    }, []);

    const load = useCallback(
        async (options?: LoadOptions) => {
            const trimmedWorkAreaId = workAreaId?.trim();
            if (!trimmedWorkAreaId) {
                resetState();
                return;
            }

            if (!options?.silent) {
                setIsLoading(true);
            }
            setError(null);

            try {
                const payload = await fetchSummaryRef.current({
                    body: [{ workAreaId: trimmedWorkAreaId }],
                });
                setSnapshot(mapProductionEventsSummaryPayload(payload));
            } catch (loadError) {
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Не удалось загрузить сводку событий выпуска",
                );
                if (!options?.silent) {
                    setSnapshot(RELEASE_PRODUCTION_EVENTS_SUMMARY_EMPTY);
                }
            } finally {
                if (!options?.silent) {
                    setIsLoading(false);
                }
            }
        },
        [resetState, workAreaId],
    );

    function parseMaybeNumber(value: unknown): number | undefined {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return undefined;
            const parsed = Number(trimmed);
            if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
                return parsed;
            }
        }
        return undefined;
    }

    function parseMaybeString(value: unknown): string | undefined {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
        return undefined;
    }

    function parseKeyValuePairs(input: string): Record<string, string> {
        const pairs: Record<string, string> = {};
        const regex = /([a-zA-Z0-9_]+)=([^,]+)/g;
        let match: RegExpExecArray | null = null;
        // eslint-disable-next-line no-cond-assign
        while ((match = regex.exec(input)) !== null) {
            const key = match[1];
            const value = match[2].trim();
            pairs[key] = value;
        }
        return pairs;
    }

    function parseProductionEventsSummaryChangedPayload(
        payload: unknown,
    ): {
        workAreaId?: string;
        unprocessedCount?: number;
        processedCount?: number;
        totalCount?: number;
        changedAt?: string;
    } | null {
        let normalized: unknown = payload;
        if (typeof normalized === "string") {
            const trimmed = normalized.trim();
            if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
                try {
                    normalized = JSON.parse(trimmed) as unknown;
                } catch {
                    // ignore
                }
            }
        }

        if (!Array.isArray(normalized) || normalized.length === 0) {
            return null;
        }

        const first = normalized[0] as Record<string, unknown> | null | undefined;
        if (!first || typeof first !== "object") {
            return null;
        }

        const directWorkAreaId = parseMaybeString(first.work_area_id ?? first.workAreaId);
        const directUnprocessed = parseMaybeNumber(first.unprocessed_count ?? first.unprocessedCount);
        const directProcessed = parseMaybeNumber(first.processed_count ?? first.processedCount);
        const directTotal = parseMaybeNumber(first.total_count ?? first.totalCount);

        const rawChangedAt = first.changed_at ?? first.changedAt;
        const rawChangedAtString = typeof rawChangedAt === "string" ? rawChangedAt : undefined;

        // В реальном примере STOMP `changed_at` приходит одной строкой со всеми значениями:
        // "work_area_id=11, unprocessed_count=302, processed_count=45, total_count=347, changed_at=Wed ..."
        const hasCompositePairs =
            rawChangedAtString?.includes("work_area_id=") && rawChangedAtString.includes("unprocessed_count=");

        if (rawChangedAtString && hasCompositePairs) {
            const pairs = parseKeyValuePairs(rawChangedAtString);
            const parsedWorkAreaId = parseMaybeString(pairs.work_area_id);
            const parsedUnprocessed = parseMaybeNumber(pairs.unprocessed_count);
            const parsedProcessed = parseMaybeNumber(pairs.processed_count);
            const parsedTotal = parseMaybeNumber(pairs.total_count);
            const parsedChangedAt = pairs.changed_at || rawChangedAtString;

            return {
                workAreaId: parsedWorkAreaId,
                unprocessedCount: parsedUnprocessed,
                processedCount: parsedProcessed,
                totalCount: parsedTotal,
                changedAt: parsedChangedAt,
            };
        }

        return {
            workAreaId: directWorkAreaId,
            unprocessedCount: directUnprocessed,
            processedCount: directProcessed,
            totalCount: directTotal,
            changedAt: parseMaybeString(rawChangedAt) ?? undefined,
        };
    }

    useEffect(() => {
        resetState();
    }, [workAreaId, resetState]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        void load();
    }, [enabled, load]);

    useMaterialsFrontRollReleaseProductionEventsSummaryChangedSubscription({
        enabled: Boolean(workAreaId?.trim()),
        onEvent: (payload) => {
            const parsed = parseProductionEventsSummaryChangedPayload(payload);
            const currentWorkAreaId = workAreaId?.trim();

            if (enabledRef.current && parsed) {
                // Игнорируем события для других workAreaId.
                if (parsed.workAreaId && currentWorkAreaId && parsed.workAreaId !== currentWorkAreaId) {
                    onRelatedDataReloadRef.current?.();
                    return;
                }

                if (
                    parsed.unprocessedCount !== undefined &&
                    parsed.processedCount !== undefined &&
                    Number.isFinite(parsed.unprocessedCount) &&
                    Number.isFinite(parsed.processedCount)
                ) {
                    setSnapshot((prev) => {
                        const baseFields =
                            prev.fields.length > 0
                                ? prev.fields
                                : RELEASE_PRODUCTION_EVENTS_SUMMARY_DEFAULT_FIELDS.map((f) => ({
                                      ...f,
                                      value: 0,
                                  }));

                        const unprocessedValue = parsed.unprocessedCount ?? 0;
                        const processedValue = parsed.processedCount ?? 0;

                        return {
                            ...prev,
                            unprocessedCount: unprocessedValue,
                            processedCount: processedValue,
                            totalCount: parsed.totalCount ?? prev.totalCount,
                            changedAt: parsed.changedAt ?? prev.changedAt,
                            fields: baseFields.map((field) => {
                                if (field.key === "unprocessed_count") {
                                    return { ...field, value: unprocessedValue };
                                }
                                if (field.key === "processed_count") {
                                    return { ...field, value: processedValue };
                                }
                                return field;
                            }),
                        };
                    });
                } else {
                    // Если STOMP формат неожиданно изменился — делаем fallback на REST.
                    void load({ silent: true });
                }
            } else if (enabledRef.current) {
                // payload не распознан — fallback.
                void load({ silent: true });
            }

            onRelatedDataReloadRef.current?.();
        },
    });

    return {
        snapshot,
        unprocessedCount: snapshot.unprocessedCount,
        totalCount: snapshot.totalCount,
        changedAt: snapshot.changedAt,
        isLoading,
        error,
        reload: load,
    };
}

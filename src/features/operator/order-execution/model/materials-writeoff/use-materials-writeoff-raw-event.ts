import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rqClient } from "@/shared/api/instance";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import { useSession } from "@/shared/model/session";

import { buildAcceptRawFromEventBody, buildDiscardEventRollBody } from "./build-resolve-raw-event-body";
import { mapAcceptRawFromEventPayload } from "./map-accept-raw-from-event-payload";
import { mapDiscardEventRollPayload } from "./map-discard-event-roll-payload";
import { resolveMaterialsWriteoffOperatorRef } from "./resolve-materials-writeoff-operator-ref";
import { mapEventReleaseProductionPayload } from "../release/map-event-release-production-payload";
import {
    RELEASE_EMPTY_PRODUCTION_EVENT,
    type ReleaseProductionEventSnapshot,
} from "../release/production-event-types";

export type MaterialsWriteoffRawEventPrefill = {
    lengthM: number | null;
    weightKg: number | null;
    materialRollId: string;
    barcode: string;
};

type UseMaterialsWriteoffRawEventOptions = {
    workAreaId?: string;
    enabled: boolean;
    onAcceptPrefill?: (prefill: MaterialsWriteoffRawEventPrefill) => void;
    /** После успешного accept/discard — обновить presence / журнал и т. п. */
    onResolved?: () => void | Promise<void>;
};

export function useMaterialsWriteoffRawEvent({
    workAreaId,
    enabled,
    onAcceptPrefill,
    onResolved,
}: UseMaterialsWriteoffRawEventOptions) {
    const { session } = useSession();
    const [rawEvent, setRawEvent] = useState<ReleaseProductionEventSnapshot>(RELEASE_EMPTY_PRODUCTION_EVENT);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDiscarding, setIsDiscarding] = useState(false);
    const [discardError, setDiscardError] = useState<string | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);

    const onAcceptPrefillRef = useRef(onAcceptPrefill);
    onAcceptPrefillRef.current = onAcceptPrefill;
    const onResolvedRef = useRef(onResolved);
    onResolvedRef.current = onResolved;

    const { mutateAsync: fetchEventRollWriteOff } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.eventRollWriteOff,
        {},
    );
    const { mutateAsync: discardEventRollRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.discardEventRoll,
        {},
    );
    const { mutateAsync: acceptRawFromEventRequest } = rqClient.useMutation(
        "post",
        REST_FUNCTION_PATHS.acceptRawFromEvent,
        {},
    );

    const fetchEventRollWriteOffRef = useRef(fetchEventRollWriteOff);
    fetchEventRollWriteOffRef.current = fetchEventRollWriteOff;
    const discardEventRollRequestRef = useRef(discardEventRollRequest);
    discardEventRollRequestRef.current = discardEventRollRequest;
    const acceptRawFromEventRequestRef = useRef(acceptRawFromEventRequest);
    acceptRawFromEventRequestRef.current = acceptRawFromEventRequest;

    const load = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        if (!trimmedWorkAreaId) {
            setRawEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
            setError("Не удалось определить workAreaId этапа");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = await fetchEventRollWriteOffRef.current({
                body: [{ workAreaId: trimmedWorkAreaId }],
            });
            setRawEvent(mapEventReleaseProductionPayload(payload));
        } catch (loadError) {
            setRawEvent(RELEASE_EMPTY_PRODUCTION_EVENT);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Не удалось загрузить событие списания с машины",
            );
        } finally {
            setIsLoading(false);
        }
    }, [workAreaId]);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        void load();
    }, [enabled, load]);

    const discardEventRoll = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const machineEventSignalId = rawEvent.currentEvent?.machineEventSignalId.trim() ?? "";

        if (!trimmedWorkAreaId) {
            setDiscardError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!machineEventSignalId) {
            setDiscardError("Не удалось определить идентификатор события");
            return;
        }

        const operatorRef = resolveMaterialsWriteoffOperatorRef(session);

        setIsDiscarding(true);
        setDiscardError(null);
        setAcceptError(null);

        try {
            const payload = await discardEventRollRequestRef.current({
                body: buildDiscardEventRollBody({
                    workAreaId: trimmedWorkAreaId,
                    machineEventSignalId,
                    operatorRef: operatorRef || undefined,
                }),
            });
            mapDiscardEventRollPayload(payload);
            await load();
            await onResolvedRef.current?.();
        } catch (discardLoadError) {
            setDiscardError(
                discardLoadError instanceof Error
                    ? discardLoadError.message
                    : "Не удалось отклонить событие списания с машины",
            );
        } finally {
            setIsDiscarding(false);
        }
    }, [load, rawEvent.currentEvent?.machineEventSignalId, session, workAreaId]);

    const acceptRawFromEvent = useCallback(async () => {
        const trimmedWorkAreaId = workAreaId?.trim();
        const machineEventSignalId = rawEvent.currentEvent?.machineEventSignalId.trim() ?? "";

        if (!trimmedWorkAreaId) {
            setAcceptError("Не удалось определить workAreaId этапа");
            return;
        }

        if (!machineEventSignalId) {
            setAcceptError("Не удалось определить идентификатор события");
            return;
        }

        const operatorRef = resolveMaterialsWriteoffOperatorRef(session);

        setIsAccepting(true);
        setAcceptError(null);
        setDiscardError(null);

        try {
            const payload = await acceptRawFromEventRequestRef.current({
                body: buildAcceptRawFromEventBody({
                    workAreaId: trimmedWorkAreaId,
                    machineEventSignalId,
                    operatorRef: operatorRef || undefined,
                }),
            });
            const result = mapAcceptRawFromEventPayload(payload);

            onAcceptPrefillRef.current?.({
                lengthM: result.prefillOutputLengthM,
                weightKg: result.prefillOutputWeightKg,
                materialRollId: result.prefillMaterialRollId,
                barcode: result.prefillBarcode,
            });

            await load();
            await onResolvedRef.current?.();
        } catch (acceptLoadError) {
            setAcceptError(
                acceptLoadError instanceof Error
                    ? acceptLoadError.message
                    : "Не удалось зарегистрировать событие списания с машины",
            );
        } finally {
            setIsAccepting(false);
        }
    }, [load, rawEvent.currentEvent?.machineEventSignalId, session, workAreaId]);

    const rows = useMemo(
        () =>
            rawEvent.currentEvent?.displayRows.map((row) => ({
                characteristic: row.characteristic,
                value: row.value,
                unit: row.unit,
            })) ?? [],
        [rawEvent.currentEvent],
    );

    return {
        rawEvent,
        rows,
        isLoading,
        error,
        discardEventRoll,
        isDiscarding,
        discardError,
        acceptRawFromEvent,
        isAccepting,
        acceptError,
        reload: load,
    };
}

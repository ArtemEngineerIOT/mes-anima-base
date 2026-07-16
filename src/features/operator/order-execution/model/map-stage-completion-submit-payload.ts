import type { ApiSchemas } from "@/shared/api/schema";

import { pickString } from "./release/map-release-rpc-utils";
import type { StageBlockingIssue } from "./stage-completion-types";

const OK_ERROR_CODE = "OK";
const COMPLETION_NOT_ALLOWED = "COMPLETION_NOT_ALLOWED";

export type StageCompletionPausedSiblingModal = {
    code: string;
    title: string;
    message: string;
};

export type StageCompletionSubmitMapped =
    | {
          ok: true;
          workAreaId: string;
          statusCode: string;
          pausedSiblingModal: StageCompletionPausedSiblingModal | null;
      }
    | {
          ok: false;
          errorCode: string;
          errorMessage: string;
          blockingIssues: StageBlockingIssue[];
      };

function readObjectArray(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function mapBlockingIssue(row: Record<string, unknown>): StageBlockingIssue | null {
    const message = pickString(row.message);
    if (!message) {
        return null;
    }

    return {
        code: pickString(row.code) ?? "",
        message,
    };
}

function mapPausedSiblingModal(row: Record<string, unknown>): StageCompletionPausedSiblingModal | null {
    const title = pickString(row.title);
    const message = pickString(row.message);
    if (!title && !message) {
        return null;
    }

    return {
        code: pickString(row.code) ?? "",
        title: title ?? "На машине обнаружен признак приостановленных этапов",
        message: message ?? "",
    };
}

export function mapStageCompletionSubmitPayload(
    payload: ApiSchemas["OrderExecutionStageCompletionSubmitResponse"] | undefined,
): StageCompletionSubmitMapped {
    const fallbackMessage = "Не удалось завершить этап";
    const wrapper = payload?.[0];
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    const resultItem = (wrapper.result?.[0] ?? {}) as Record<string, unknown>;
    const blockingIssues = readObjectArray(resultItem.blocking_issues ?? resultItem.blockingIssues)
        .map(mapBlockingIssue)
        .filter((row): row is StageBlockingIssue => row !== null);

    if (errorCode === OK_ERROR_CODE) {
        const pausedRaw = readObjectArray(resultItem.paused_sibling_modal ?? resultItem.pausedSiblingModal);
        const pausedSiblingModal = pausedRaw[0] ? mapPausedSiblingModal(pausedRaw[0]) : null;

        return {
            ok: true,
            workAreaId: pickString(resultItem.work_area_id ?? resultItem.workAreaId) ?? "",
            statusCode: pickString(resultItem.status_code ?? resultItem.statusCode) ?? "COMPLETED",
            pausedSiblingModal,
        };
    }

    if (errorCode === COMPLETION_NOT_ALLOWED) {
        return {
            ok: false,
            errorCode,
            errorMessage: wrapper.error_message?.trim() || fallbackMessage,
            blockingIssues,
        };
    }

    throw new Error(wrapper.error_message?.trim() || fallbackMessage);
}

import { fetchClient } from "@/shared/api/fetch-client";
import { REST_FUNCTION_PATHS } from "@/shared/api/rest-paths";
import type { ApiSchemas } from "@/shared/api/schema";
import type { ClientEnvironment } from "@/shared/lib/client-environment";
import type { MesBootstrap } from "@/shared/lib/mes-user-profile";
import { readValidStoredAuthToken } from "@/shared/model/auth-token";

const OK_ERROR_CODE = "OK";

function pickString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed || undefined;
}

export function resolveClientEnvironmentOperatorRef(
    bootstrap: MesBootstrap,
    loginName?: string,
): string {
    return (
        bootstrap.profile.employeeId?.trim() ||
        bootstrap.profile.userAccountId?.trim() ||
        loginName?.trim() ||
        ""
    );
}

function mapClientEnvironmentRow(row: Record<string, unknown>): ClientEnvironment | null {
    const tempFilesFolder =
        pickString(row.tempFilesFolder ?? row.temp_files_folder) ??
        pickString(row.temp_folder_path ?? row.tempFolderPath) ??
        pickString(row.temp_folder ?? row.tempFolder);
    if (!tempFilesFolder) {
        return null;
    }

    return {
        clientLogin: pickString(row.clientLogin ?? row.client_login) ?? "",
        tempFilesFolder,
        clientTimeZone: pickString(row.clientTimeZone ?? row.client_time_zone) ?? "",
    };
}

function mapClientEnvironmentPayload(
    payload: ApiSchemas["ClientGetEnvironmentResponse"] | undefined,
): ClientEnvironment {
    const fallbackMessage = "Не удалось получить окружение клиента";
    const first = payload?.[0] as Record<string, unknown> | undefined;
    if (!first) {
        throw new Error(fallbackMessage);
    }

    // Плоский ответ: [{ clientLogin, tempFilesFolder, clientTimeZone }]
    const direct = mapClientEnvironmentRow(first);
    if (direct) {
        return direct;
    }

    // Совместимость с обёрткой error_code / result
    const errorCode = pickString(first.error_code ?? first.errorCode)?.toUpperCase();
    if (errorCode && errorCode !== OK_ERROR_CODE) {
        throw new Error(pickString(first.error_message ?? first.errorMessage) || fallbackMessage);
    }

    const result = first.result;
    const resultItem = Array.isArray(result) ? (result[0] as Record<string, unknown> | undefined) : undefined;
    const fromResult = resultItem ? mapClientEnvironmentRow(resultItem) : null;
    if (!fromResult) {
        throw new Error(fallbackMessage);
    }

    return fromResult;
}

const inflightByKey = new Map<string, Promise<ClientEnvironment>>();

async function fetchClientEnvironmentFromBackend(operatorRef: string): Promise<ClientEnvironment> {
    const trimmedOperatorRef = operatorRef.trim();
    if (!trimmedOperatorRef) {
        throw new Error("Не удалось определить operatorRef для окружения клиента");
    }

    const authToken = readValidStoredAuthToken();
    if (!authToken) {
        throw new Error("Не удалось получить окружение клиента");
    }

    const response = await fetchClient.POST(REST_FUNCTION_PATHS.clientGetEnvironment, {
        body: [{ operatorRef: trimmedOperatorRef }],
    });

    if (response.error || !response.data) {
        const status = response.response?.status;
        throw new Error(
            status === 403 ? "Нет доступа к окружению клиента" : "Не удалось получить окружение клиента",
        );
    }

    return mapClientEnvironmentPayload(response.data);
}

/** Дедупликация параллельных вызовов (login + гидратация после F5). */
export function resolveClientEnvironmentFromBackend(
    bootstrap: MesBootstrap,
    loginName?: string,
): Promise<ClientEnvironment> {
    const operatorRef = resolveClientEnvironmentOperatorRef(bootstrap, loginName);
    const key = `${readValidStoredAuthToken() ?? ""}:${operatorRef}`;
    const existing = inflightByKey.get(key);
    if (existing) {
        return existing;
    }

    const promise = fetchClientEnvironmentFromBackend(operatorRef).finally(() => {
        inflightByKey.delete(key);
    });
    inflightByKey.set(key, promise);
    return promise;
}

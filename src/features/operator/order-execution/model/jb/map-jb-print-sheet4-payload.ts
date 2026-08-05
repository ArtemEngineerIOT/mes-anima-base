import type { ApiSchemas } from "@/shared/api/schema";
import { resolveClientTempReportUrl } from "@/shared/lib/resolve-report-preview-url";

function pickString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed || undefined;
}

function isSucceeded(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "true" || normalized === "1" || normalized === "ok";
    }
    if (typeof value === "number") {
        return value === 1;
    }
    return false;
}

/** Извлекает `fileName` из ответа jbPrintSheet4 и собирает URL с `pathFolder` окружения. */
export function mapJbPrintSheet4Payload(
    payload: ApiSchemas["JbPrintSheet4Response"] | undefined,
    pathFolder: string,
): string {
    const fallbackMessage = "Не удалось получить PDF отчёта";
    const row = payload?.[0] as Record<string, unknown> | undefined;
    if (!row) {
        throw new Error(fallbackMessage);
    }

    if (!isSucceeded(row.succeeded ?? row.Succeeded)) {
        throw new Error(fallbackMessage);
    }

    const fileName = pickString(row.fileName ?? row.file_name);
    if (!fileName) {
        throw new Error(fallbackMessage);
    }

    const url = resolveClientTempReportUrl(pathFolder, fileName);
    if (!url) {
        throw new Error("Не удалось определить путь к PDF отчёта");
    }

    return url;
}

/**
 * Публичный URL PDF из `report_preview_file_path` бэка (AggreGate).
 * На диске: `/opt/AggreGate/admin/web/temp/{uuid}/{uuid}.pdf` → в браузере: `/web/temp/{uuid}/{uuid}.pdf`.
 */
const UUID_SEGMENT = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
/** Бэк иногда склеивает каталог и имя файла без «/»: `{uuid}{uuid}.pdf`. */
const GLUED_UUID_FILE_NAME = new RegExp(
    `^(${UUID_SEGMENT})(${UUID_SEGMENT})(\\.[^./]+)$`,
    "i",
);

function fixGluedUuidFileName(fileName: string): string {
    return fileName.replace(GLUED_UUID_FILE_NAME, "$1/$2$3");
}

function normalizeReportPreviewPath(path: string): string {
    let normalized = path;
    if (normalized.startsWith("/admin/web/")) {
        normalized = normalized.slice("/admin".length);
    }

    const lastSlashIndex = normalized.lastIndexOf("/");
    if (lastSlashIndex === -1) {
        return fixGluedUuidFileName(normalized);
    }

    const directory = normalized.slice(0, lastSlashIndex + 1);
    const fileName = normalized.slice(lastSlashIndex + 1);
    return `${directory}${fixGluedUuidFileName(fileName)}`;
}

export function resolveReportPreviewUrl(filePath: string): string {
    const trimmed = filePath.trim();
    if (!trimmed) {
        return "";
    }

    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const url = new URL(trimmed);
            url.pathname = normalizeReportPreviewPath(url.pathname);
            return url.href;
        } catch {
            return trimmed;
        }
    }

    const path = normalizeReportPreviewPath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);

    if (typeof window === "undefined") {
        return path;
    }

    return new URL(path, window.location.origin).href;
}

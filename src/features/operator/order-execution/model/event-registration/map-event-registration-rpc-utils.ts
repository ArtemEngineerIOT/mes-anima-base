const OK_ERROR_CODE = "OK";

export function assertEventRegistrationRpcOk(
    wrapper: { error_code?: string; error_message?: string | null } | undefined,
    fallbackMessage: string,
): void {
    if (!wrapper) {
        throw new Error(fallbackMessage);
    }

    const errorCode = (wrapper.error_code ?? "").trim().toUpperCase();
    if (errorCode !== OK_ERROR_CODE) {
        throw new Error(wrapper.error_message?.trim() || fallbackMessage);
    }
}

export function pickString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

export function pickNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

export function pickBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (value === 1 || value === "1" || value === "true" || value === "TRUE") {
        return true;
    }
    return false;
}

/**
 * UUID для клиентских id. `crypto.randomUUID()` доступен только в secure context (HTTPS / localhost).
 * На HTTP по IP используем детерминированный fallback.
 */
export function createRandomId(prefix = ""): string {
    const fallback = `${prefix}${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const cryptoApi = globalThis.crypto;

    if (typeof cryptoApi?.randomUUID !== "function" || !globalThis.isSecureContext) {
        return fallback;
    }

    try {
        return `${prefix}${cryptoApi.randomUUID()}`;
    } catch {
        return fallback;
    }
}

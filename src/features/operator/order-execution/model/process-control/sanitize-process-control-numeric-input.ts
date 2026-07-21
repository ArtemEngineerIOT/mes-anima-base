/** Только цифры (целое неотрицательное число). */
export function sanitizeProcessControlIntegerInput(value: string): string {
    return value.replace(/\D/g, "");
}

/** Цифры и один десятичный разделитель (`,` или `.`). */
export function sanitizeProcessControlDecimalInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const match = cleaned.match(/^\d*(?:[.,]\d*)?/);
    return match?.[0] ?? "";
}

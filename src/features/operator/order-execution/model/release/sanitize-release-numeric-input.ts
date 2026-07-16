/** Оставляет только цифры и один десятичный разделитель (`,` или `.`). */
export function sanitizeReleaseNumericInput(value: string): string {
    const cleaned = value.replace(/[^\d.,]/g, "");
    const match = cleaned.match(/^\d*(?:[.,]\d*)?/);
    return match?.[0] ?? "";
}

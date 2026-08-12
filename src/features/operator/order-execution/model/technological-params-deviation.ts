/** Парсит допуск из строк вида «± 5», «±5», «5». */
export function parseTechnologicalParamDeviationTolerance(deviationPm: string): number | null {
    const trimmed = deviationPm.trim();
    if (!trimmed || trimmed === "—") {
        return null;
    }

    const match = trimmed.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    if (!match) {
        return null;
    }

    const value = Number(match[0]);
    return Number.isFinite(value) ? Math.abs(value) : null;
}

function parseTechnologicalParamNumber(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—") {
        return null;
    }

    const normalized = trimmed.replace(",", ".");
    const match = normalized.match(/-?\d+(?:\.\d+)?/);
    if (!match) {
        return null;
    }

    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
}

function splitComparableParts(value: string): string[] {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—") {
        return [];
    }

    return trimmed.split("-").map((part) => part.trim()).filter((part) => part !== "");
}

/**
 * true, если текущее значение выходит за уставку ± допуск
 * (для составных «a-b-c» — если хотя бы одна часть вне допуска).
 */
export function isTechnologicalParamOutOfDeviation(options: {
    currentValue: string;
    standardValue: string;
    deviationPm: string;
}): boolean {
    const tolerance = parseTechnologicalParamDeviationTolerance(options.deviationPm);
    if (tolerance === null) {
        return false;
    }

    const standardParts = splitComparableParts(options.standardValue);
    const currentParts = splitComparableParts(options.currentValue);
    if (standardParts.length === 0 || currentParts.length === 0) {
        return false;
    }

    const partCount = Math.max(standardParts.length, currentParts.length);
    for (let index = 0; index < partCount; index += 1) {
        const standard = parseTechnologicalParamNumber(standardParts[index] ?? "");
        const current = parseTechnologicalParamNumber(currentParts[index] ?? "");
        if (standard === null || current === null) {
            continue;
        }

        if (Math.abs(current - standard) > tolerance) {
            return true;
        }
    }

    return false;
}

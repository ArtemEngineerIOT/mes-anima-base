import type { MaterialsInstallationPlace } from "./materials-writeoff-form";
import type { MaterialsPresenceRow, MaterialsPresenceStatus, MaterialsWriteoffData } from "./types";

function formatScanTime(date = new Date()): string {
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mi}:${ss}`;
}

function mapInstallationToStatus(place: MaterialsInstallationPlace): MaterialsPresenceStatus {
    return place === "ON_UNWIND" ? "ON_UNWIND" : "WAITING";
}

export function buildPresenceRowFromScan(params: {
    barcode: string;
    installationPlace: MaterialsInstallationPlace;
    data: MaterialsWriteoffData;
}): MaterialsPresenceRow | null {
    const card = params.data.seriesCard;
    if (!card) {
        return null;
    }

    const status = mapInstallationToStatus(params.installationPlace);
    const materialRollId = params.data.materialRollId || params.barcode;

    return {
        id: materialRollId,
        materialRollId,
        barcode: params.barcode,
        nomenclatureName: card.nomenclatureName,
        nomenclatureCode: card.nomenclatureCode,
        scannedAt: formatScanTime(),
        status,
        quantityUom: card.quantityUom,
        currentLengthM: card.currentLengthM,
        currentWeightKg: card.currentWeightKg,
        canMoveToUnwind: status === "WAITING",
        writeOffAllowed: status === "ON_UNWIND",
    };
}

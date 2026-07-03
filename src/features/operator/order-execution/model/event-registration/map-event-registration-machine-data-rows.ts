import type { EventMachineTelemetry } from "./types";
import type { MachineDataPanelRow } from "@/shared/ui/kit/machine-data-panel";

export function mapEventRegistrationMachineDataRows(telemetry: EventMachineTelemetry): MachineDataPanelRow[] {
    return [
        { characteristic: "Стопов", value: String(telemetry.stopsCount), unit: "шт." },
        { characteristic: "Ударов ножа", value: String(telemetry.knifeHitsCount), unit: "шт." },
        { characteristic: "Скорость машины", value: telemetry.speedValue, unit: telemetry.speedUnit },
    ];
}

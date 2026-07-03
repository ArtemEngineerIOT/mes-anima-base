import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";
import { sectionBlockTitleClassName } from "@/shared/ui/kit/styles/section-block-title";
import { Label } from "@/shared/ui/kit/label";
import { Input } from "@/shared/ui/kit/input";

import type { DefectWeighingModel } from "../model/use-defect-weighing";

const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

type DefectWeighingFiltersProps = {
    model: DefectWeighingModel;
};

export function DefectWeighingFilters({ model }: DefectWeighingFiltersProps) {
    const {
        machineOptions,
        machinesLoading,
        resourceCode,
        setResourceCode,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
    } = model;

    return (
        <Card className="shrink-0 py-0 gap-0">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className={sectionBlockTitleClassName}>Взвешивание брака</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="grid min-w-0 gap-1.5">
                        <Label htmlFor="defect-weighing-machine" className={comboboxFieldLabelClassName}>
                            Машина
                        </Label>
                        <select
                            id="defect-weighing-machine"
                            className={selectClass}
                            value={resourceCode}
                            disabled={machinesLoading || machineOptions.length === 0}
                            onChange={(event) => setResourceCode(event.target.value)}
                        >
                            {machineOptions.map((machine) => (
                                <option key={machine.resourceCode} value={machine.resourceCode}>
                                    {machine.resourceCode}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid min-w-0 gap-1.5">
                        <Label htmlFor="defect-weighing-date-from" className={comboboxFieldLabelClassName}>
                            Период с
                        </Label>
                        <Input
                            id="defect-weighing-date-from"
                            type="date"
                            value={dateFrom}
                            onChange={(event) => setDateFrom(event.target.value)}
                        />
                    </div>
                    <div className="grid min-w-0 gap-1.5">
                        <Label htmlFor="defect-weighing-date-to" className={comboboxFieldLabelClassName}>
                            Период по
                        </Label>
                        <Input
                            id="defect-weighing-date-to"
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

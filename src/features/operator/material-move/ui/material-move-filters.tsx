import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";
import { sectionBlockTitleClassName } from "@/shared/ui/kit/styles/section-block-title";
import { Label } from "@/shared/ui/kit/label";
import { MultiSelectCombobox } from "@/shared/ui/kit/multi-select-combobox";
import { comboboxFieldLabelClassName } from "@/shared/ui/kit/styles/combobox-field-label";

import type { MaterialMoveKindId, MaterialMoveWarehouseId } from "../model/types";

const selectClass =
    "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

type MaterialMoveFiltersProps = {
    kindOptions: { id: MaterialMoveKindId; label: string }[];
    sourceOptions: { id: MaterialMoveWarehouseId; label: string }[];
    destOptions: { id: MaterialMoveWarehouseId; label: string }[];
    selectedKinds: MaterialMoveKindId[];
    sourceWarehouse: MaterialMoveWarehouseId;
    destWarehouse: MaterialMoveWarehouseId;
    onToggleKind: (id: MaterialMoveKindId) => void;
    onClearKinds: () => void;
    onSourceChange: (id: MaterialMoveWarehouseId) => void;
    onDestChange: (id: MaterialMoveWarehouseId) => void;
};

export function MaterialMoveFilters({
    kindOptions,
    sourceOptions,
    destOptions,
    selectedKinds,
    sourceWarehouse,
    destWarehouse,
    onToggleKind,
    onClearKinds,
    onSourceChange,
    onDestChange,
}: MaterialMoveFiltersProps) {
    return (
        <Card className="shrink-0 py-0 gap-0">
            <CardHeader className="pb-2 pt-4">
                <CardTitle className={sectionBlockTitleClassName}>Перемещение материалов</CardTitle>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
                <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                    <MultiSelectCombobox
                        className="min-w-0 w-full"
                        fieldLabel="Вид номенклатуры"
                        options={kindOptions.map((k) => ({ value: k.id, label: k.label }))}
                        selected={selectedKinds}
                        onToggle={onToggleKind}
                        onClear={onClearKinds}
                        clearAriaLabel="Снять выбор видов номенклатуры"
                        placeholder="Не выбрано"
                    />
                    <div className="grid min-w-0 gap-1.5">
                        <Label htmlFor="material-move-source" className={comboboxFieldLabelClassName}>
                            Склад источник
                        </Label>
                        <select
                            id="material-move-source"
                            className={selectClass}
                            value={sourceWarehouse}
                            onChange={(e) => onSourceChange(e.target.value as MaterialMoveWarehouseId)}
                        >
                            {sourceOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid min-w-0 gap-1.5">
                        <Label htmlFor="material-move-dest" className={comboboxFieldLabelClassName}>
                            Склад приёмник
                        </Label>
                        <select
                            id="material-move-dest"
                            className={selectClass}
                            value={destWarehouse}
                            onChange={(e) => onDestChange(e.target.value as MaterialMoveWarehouseId)}
                        >
                            {destOptions.map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

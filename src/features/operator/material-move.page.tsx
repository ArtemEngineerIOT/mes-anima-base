import { useMaterialMove } from "@/features/operator/material-move/model/use-material-move";
import { MaterialMoveFilters } from "@/features/operator/material-move/ui/material-move-filters";
import { MaterialMoveWorkspace } from "@/features/operator/material-move/ui/material-move-workspace";

function MaterialMovePage() {
    const model = useMaterialMove();

    return (
        <div className="flex h-full min-h-0 flex-col">
            <MaterialMoveFilters
                kindOptions={model.kindOptions}
                sourceOptions={model.sourceWarehouseOptions}
                destOptions={model.destWarehouseOptions}
                selectedKinds={model.selectedKinds}
                sourceWarehouse={model.sourceWarehouse}
                destWarehouse={model.destWarehouse}
                onToggleKind={model.toggleKind}
                onClearKinds={model.clearKinds}
                onSourceChange={model.setSourceWarehouse}
                onDestChange={model.setDestWarehouse}
            />

            <div className="mt-3 flex min-h-0 flex-1 flex-col">
                <MaterialMoveWorkspace model={model} />
            </div>
        </div>
    );
}

export const Component = MaterialMovePage;

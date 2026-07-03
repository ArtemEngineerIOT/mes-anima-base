import { useDefectWeighing } from "@/features/operator/defect-weighing/model/use-defect-weighing";
import { DefectWeighingFilters } from "@/features/operator/defect-weighing/ui/defect-weighing-filters";
import { DefectWeighingWorkspace } from "@/features/operator/defect-weighing/ui/defect-weighing-workspace";

function DefectWeighingPage() {
    const model = useDefectWeighing();

    return (
        <div className="flex h-full min-h-0 flex-col">
            <DefectWeighingFilters model={model} />
            <div className="mt-3 flex min-h-0 flex-1 flex-col">
                <DefectWeighingWorkspace model={model} />
            </div>
        </div>
    );
}

export const Component = DefectWeighingPage;

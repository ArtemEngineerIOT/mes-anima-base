import { Card, CardContent } from "@/shared/ui/kit/card";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

import type { DefectWeighingModel } from "../model/use-defect-weighing";
import { DefectWeighingFormPanel } from "./defect-weighing-form-panel";
import { DefectWeighingJournalPanel } from "./defect-weighing-journal-panel";
import { DefectWeighingStagesPanel } from "./defect-weighing-stages-panel";

type DefectWeighingWorkspaceProps = {
    model: DefectWeighingModel;
};

export function DefectWeighingWorkspace({ model }: DefectWeighingWorkspaceProps) {
    return (
        <Card className="flex min-h-0 flex-1 flex-col gap-0 py-0">
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:divide-x lg:divide-border">
                    <div className="flex min-h-0 min-w-0 flex-col px-4 py-4">
                        <div className={cnSectionBlockTitle("shrink-0 pb-3")}>Этапы на машине</div>
                        <DefectWeighingStagesPanel model={model} />
                    </div>
                    <div className="app-scroll flex min-h-0 min-w-0 flex-col gap-6 overflow-auto px-4 py-4">
                        <div>
                            <div className={cnSectionBlockTitle("pb-3")}>Регистрация брака</div>
                            <DefectWeighingFormPanel model={model} />
                        </div>
                        <DefectWeighingJournalPanel model={model} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

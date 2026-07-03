import { Card, CardContent } from "@/shared/ui/kit/card";
import { sectionBlockTitleClassName } from "@/shared/ui/kit/styles/section-block-title";
import { useMaterialOrderWorkspace } from "../model/use-material-order-workspace";
import { MaterialOrderFormPanel } from "./material-order-form-panel";
import { MaterialOrderLocationPanel } from "./material-order-location-panel";

/**
 * Двухпанельный блок по UC-12: «Формирование заказа» и «Статус заказа» (макет + мок-данные до интеграции с DWH/1С).
 */
export function MaterialOrderWorkspaceCard() {
    const workspace = useMaterialOrderWorkspace();

    return (
        <Card className="flex min-h-0 flex-1 flex-col gap-0 py-0">
            <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
                <div className="app-scroll min-h-0 flex-1 overflow-auto">
                    <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">
                        <div className="min-w-0">
                            <div className="px-4 py-3">
                                <div className={sectionBlockTitleClassName}>Формирование заказа</div>
                            </div>
                            <div className="border-border px-4 py-3 pb-4 lg:border-r">
                                <MaterialOrderFormPanel workspace={workspace} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="px-4 py-3">
                                <div className={sectionBlockTitleClassName}>Статус заказа</div>
                            </div>
                            <div className="px-4 py-3 pb-4">
                                <MaterialOrderLocationPanel workspace={workspace} />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

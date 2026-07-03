import { MaterialOrderWorkspaceCard } from "@/features/operator/material-order/ui/material-order-workspace-card";

function MaterialOrderPage() {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <MaterialOrderWorkspaceCard />
        </div>
    );
}

export const Component = MaterialOrderPage;

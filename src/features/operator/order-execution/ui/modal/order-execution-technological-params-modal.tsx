import { Button } from "@/shared/ui/kit/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/kit/dialog";
import { Icon } from "@/shared/ui/kit/icon";

import type { MachineId } from "../../model/types";
import { OrderExecutionTechnologicalParamsPanel } from "../order-execution-technological-params-panel";

type OrderExecutionTechnologicalParamsModalProps = {
    machineId: MachineId;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function OrderExecutionTechnologicalParamsModal({
    machineId,
    open,
    onOpenChange,
}: OrderExecutionTechnologicalParamsModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="xl" className="flex max-h-[min(90vh,900px)] flex-col gap-0 overflow-hidden">
                <DialogHeader className="flex-row items-start justify-between gap-4 border-b px-4 py-3 text-left">
                    <DialogTitle>Технологические параметры {machineId}</DialogTitle>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label="Закрыть">
                            <Icon name="close" size="sm" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                <div className="app-scroll flex min-h-0 flex-1 flex-col overflow-auto px-4 py-4">
                    <OrderExecutionTechnologicalParamsPanel
                        machineId={machineId}
                        layout="embedded"
                        showTitle={false}
                        onCancel={() => onOpenChange(false)}
                    />
                </div>

                <DialogFooter className="hidden" />
            </DialogContent>
        </Dialog>
    );
}

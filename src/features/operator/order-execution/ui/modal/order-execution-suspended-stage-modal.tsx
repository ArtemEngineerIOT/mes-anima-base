import { useNavigate } from "react-router";

import { ROUTES } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/shared/ui/kit/dialog";
import { Informer } from "@/shared/ui/kit/informer";

const SUSPENDED_STAGE_TITLE = "НА МАШИНЕ ОБНАРУЖЕН ПРИЗНАК ПРИОСТАНОВЛЕННЫХ ЭТАПОВ";

const suspendedStageBody =
    "Вы завершили заказ на машине. На ней обнаружен этап/этапы со статусом «Приостановлен». Перейдите в экран «Производственный план» и выберите нужный этап.";

type OrderExecutionSuspendedStageModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Доп. строка с идентификацией этапа (мок / бэк) */
    stageLabel?: string;
};

export function OrderExecutionSuspendedStageModal({
    open,
    onOpenChange,
    stageLabel,
}: OrderExecutionSuspendedStageModalProps) {
    const navigate = useNavigate();

    const handleGoToPlan = () => {
        onOpenChange(false);
        navigate(ROUTES.OPERATOR.PRODUCTION_PLAN);
    };

    const a11yDescription = stageLabel ? `${suspendedStageBody} ${stageLabel}` : suspendedStageBody;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="sm" className="gap-0 p-0 sm:max-w-lg">
                <DialogTitle className="sr-only">{SUSPENDED_STAGE_TITLE}</DialogTitle>
                <DialogDescription className="sr-only">{a11yDescription}</DialogDescription>

                <div className="px-6 py-5">
                    <Informer
                        tone="normal"
                        variant="bordered"
                        size="m"
                        iconName="help"
                        title={SUSPENDED_STAGE_TITLE}
                        description={
                            <div className="space-y-2">
                                <p>{suspendedStageBody}</p>
                                {stageLabel ? (
                                    <p className="text-muted-foreground font-medium">{stageLabel}</p>
                                ) : null}
                            </div>
                        }
                    />
                </div>
                <DialogFooter className="border-border flex flex-row items-center justify-end gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
                    <Button type="button" size="sm" onClick={handleGoToPlan}>
                        Да
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

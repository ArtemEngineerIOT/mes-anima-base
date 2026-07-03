import { Button } from "@/shared/ui/kit/button";
import { Informer } from "@/shared/ui/kit/informer";
import { Label } from "@/shared/ui/kit/label";
import { cn } from "@/shared/lib/css";

const textareaClassName = cn(
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[72px] w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-sm shadow-xs outline-none",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
);

type ProductionPlanConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
    comment?: string;
    onCommentChange?: (value: string) => void;
    commentLabel?: string;
    commentPlaceholder?: string;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
};

export function ProductionPlanConfirmDialog({
    open,
    title,
    description,
    confirmText = "Да",
    cancelText = "Отмена",
    confirmDisabled = false,
    comment,
    onCommentChange,
    commentLabel = "Комментарий",
    commentPlaceholder = "Укажите причину приостановки",
    onConfirm,
    onClose,
}: ProductionPlanConfirmDialogProps) {
    if (!open) {
        return null;
    }

    const showCommentField = onCommentChange != null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-sm border bg-background shadow-lg">
                <div className="px-5 py-4">
                    <Informer
                        tone="normal"
                        variant="bordered"
                        iconName="help"
                        size="m"
                        title={title}
                        description={description}
                    />

                    {showCommentField && (
                        <div className="mt-4 grid gap-1.5">
                            <Label htmlFor="production-plan-pause-comment" className="text-sm font-medium">
                                {commentLabel}
                            </Label>
                            <textarea
                                id="production-plan-pause-comment"
                                value={comment ?? ""}
                                onChange={(event) => onCommentChange(event.target.value)}
                                placeholder={commentPlaceholder}
                                rows={3}
                                className={textareaClassName}
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
                    <Button
                        disabled={confirmDisabled}
                        onClick={() => {
                            void (async () => {
                                try {
                                    await onConfirm();
                                    onClose();
                                } catch {
                                    onClose();
                                }
                            })();
                        }}
                    >
                        {confirmText}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

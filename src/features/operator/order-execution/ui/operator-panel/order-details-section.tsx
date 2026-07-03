import { useEffect, useState } from "react";

import { cn } from "@/shared/lib/css";
import type { MachineData } from "../../model/types";
import { OrderExecutionCollapsibleSection } from "../collapsible-section";
import { OrderExecutionSimpleTable } from "../simple-table";
import { cnSectionBlockTitle } from "@/shared/ui/kit/styles/section-block-title";

const blockTitleClass = cnSectionBlockTitle("pb-2");
const colHeaderClass = "text-[11px] uppercase tracking-wide text-foreground";

type Props = {
    order: MachineData["order"];
    orderDetails: MachineData["operator"]["orderDetails"];
};

export function OrderExecutionOrderDetailsSection({ order, orderDetails }: Props) {
    const [comment, setComment] = useState(() => orderDetails.orderComment ?? "");

    useEffect(() => {
        setComment(orderDetails.orderComment ?? "");
    }, [orderDetails]);

    const hasTables =
        orderDetails.productAndOrder.length > 0 ||
        orderDetails.targetIndicators.length > 0 ||
        orderDetails.specification.length > 0;

    return (
        <OrderExecutionCollapsibleSection
            title="Подробная информация по заказу"
            defaultOpen={false}
            tone="normal"
        >
            <div className="flex flex-col gap-4">
                {!hasTables ? (
                    <div className="grid gap-2 text-sm">
                        <p className="text-muted-foreground">
                            Детальные параметры заказа недоступны. Краткая сводка:
                        </p>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Статус</span>
                            <span className="font-medium">{order.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Заказ</span>
                            <span className="font-medium">{order.orderId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Клиент</span>
                            <span className="font-medium">{order.client}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Продукт</span>
                            <span className="font-medium text-right">{order.product}</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <div className={blockTitleClass}>Информация о продукте/заказе</div>
                            <OrderExecutionSimpleTable
                                columns={[
                                    {
                                        key: "parameter",
                                        label: "Параметр",
                                        headerClassName: colHeaderClass,
                                    },
                                    { key: "value", label: "Значение", headerClassName: colHeaderClass },
                                ]}
                                rows={orderDetails.productAndOrder.map((r) => ({
                                    parameter: r.parameter,
                                    value: r.value,
                                }))}
                            />
                        </div>

                        <div>
                            <div className={blockTitleClass}>Целевые показатели</div>
                            <OrderExecutionSimpleTable
                                columns={[
                                    {
                                        key: "parameter",
                                        label: "Параметр",
                                        headerClassName: colHeaderClass,
                                    },
                                    { key: "value", label: "Значение", headerClassName: colHeaderClass },
                                ]}
                                rows={orderDetails.targetIndicators.map((r) => ({
                                    parameter: r.parameter,
                                    value: r.value,
                                }))}
                            />
                        </div>

                        <div>
                            <div className={blockTitleClass}>Спецификация продукта</div>
                            <OrderExecutionSimpleTable
                                columns={[
                                    {
                                        key: "parameter",
                                        label: "Параметр",
                                        headerClassName: colHeaderClass,
                                    },
                                    { key: "value", label: "Значение", headerClassName: colHeaderClass },
                                    {
                                        key: "unit",
                                        label: "Ед. изм.",
                                        headerClassName: colHeaderClass,
                                    },
                                ]}
                                rows={orderDetails.specification.map((r) => ({
                                    parameter: r.parameter,
                                    value: r.value,
                                    unit: r.unit,
                                }))}
                            />
                        </div>
                    </>
                )}

                <div>
                    <div className={blockTitleClass}>Комментарии к заказу</div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Текст комментария"
                        rows={4}
                        className={cn(
                            "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[96px] w-full resize-y rounded-sm border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
                            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                    />
                </div>
            </div>
        </OrderExecutionCollapsibleSection>
    );
}

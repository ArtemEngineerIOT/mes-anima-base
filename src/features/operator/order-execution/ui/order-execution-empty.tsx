import { Link } from "react-router";

import { ROUTES } from "@/shared/model/routes";
import { Informer } from "@/shared/ui/kit/informer";

export function OrderExecutionEmpty() {
    return (
        <Informer
            tone="system"
            variant="filled"
            size="m"
            title="На выбранной машине отсутствует назначенный этап"
            description={
                <>
                    Перейдите в раздел{" "}
                    <Link
                        to={ROUTES.OPERATOR.PRODUCTION_PLAN}
                        className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                    >
                        «Производственный план»
                    </Link>
                    .
                </>
            }
        />
    );
}

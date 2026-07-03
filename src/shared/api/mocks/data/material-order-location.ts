import type { ApiSchemas } from "@/shared/api/schema";

type LocationSeed = ApiSchemas["MachineMaterialLocationResultItem"] & {
    kindKey: "raw" | "semi" | "pack";
};

const LOCATION_SEEDS: LocationSeed[] = [
    {
        resource_id: "PR120",
        nomenclature_name: "BOPET CGPU 12 mc 1138 mm",
        nomenclature_kind_label: "Сырьё",
        kindKey: "raw",
        series_ref: "002642110   2",
        quantity: 690.5,
        quantity_uom: "KGM",
        status_label: "Доступно",
        fr_code: "",
        blocked: false,
        block_reason_code: "",
        expiry_date: "2027-06-01",
        row_selectable: true,
    },
    {
        resource_id: "PR120",
        nomenclature_name: "Поддон 1200*800 б/у",
        nomenclature_kind_label: "Упаковка",
        kindKey: "pack",
        series_ref: "",
        quantity: 29,
        quantity_uom: "PCE/NMB",
        status_label: "Доступно",
        fr_code: "",
        blocked: false,
        block_reason_code: "",
        expiry_date: "",
        row_selectable: false,
    },
    {
        resource_id: "PR120",
        nomenclature_name: "Плёнка ламинационная",
        nomenclature_kind_label: "Полуфабрикат",
        kindKey: "semi",
        series_ref: "L-8890-B",
        quantity: 1,
        quantity_uom: "рул",
        status_label: "Заказано",
        fr_code: "",
        blocked: false,
        block_reason_code: "",
        expiry_date: "2027-02-01",
        row_selectable: true,
    },
    {
        resource_id: "PR110",
        nomenclature_name: "Клей растворимый дисперсионный",
        nomenclature_kind_label: "Сырьё",
        kindKey: "raw",
        series_ref: "K-102",
        quantity: 25,
        quantity_uom: "кг",
        status_label: "Заблокирован",
        fr_code: "1-2025",
        blocked: true,
        block_reason_code: "BLOCK_CURING_VIOLATION",
        expiry_date: "",
        row_selectable: false,
    },
];

function matchesKindFilters(
    row: LocationSeed,
    includeRawMaterial: boolean,
    includeSemiFinished: boolean,
    includePackaging: boolean,
): boolean {
    if (row.kindKey === "raw") {
        return includeRawMaterial;
    }
    if (row.kindKey === "semi") {
        return includeSemiFinished;
    }
    return includePackaging;
}

export function buildMockMachineMaterialLocationResponse(
    request: ApiSchemas["MachineMaterialLocationRequestItem"],
): ApiSchemas["MachineMaterialLocationResponse"] {
    const resourceIds = request.resourceIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (resourceIds.length === 0) {
        return [
            {
                error_code: "INVALID_INPUT",
                error_message: "Укажите resourceIds",
                result: [],
            },
        ];
    }

    const includeRawMaterial = Boolean(request.includeRawMaterial);
    const includeSemiFinished = Boolean(request.includeSemiFinished);
    const includePackaging = Boolean(request.includePackaging);

    const result = LOCATION_SEEDS.filter(
        (row) =>
            row.resource_id != null &&
            resourceIds.includes(row.resource_id) &&
            matchesKindFilters(row, includeRawMaterial, includeSemiFinished, includePackaging),
    ).map(({ kindKey: _kindKey, ...row }) => row);

    return [
        {
            error_code: "OK",
            error_message: "",
            result,
            as_of: new Date().toISOString(),
            resource_ids: resourceIds,
        },
    ];
}

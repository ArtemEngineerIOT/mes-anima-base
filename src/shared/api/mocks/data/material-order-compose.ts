const MOCK_COMPOSE_LINES_BY_WORK_AREA: Record<
    string,
    Array<{
        delivery_kind: string;
        nomenclature_name: string;
        requested_quantity: number;
        quantity_uom: string;
        nomenclature_code: string;
        semi_finished_pick_required: boolean;
    }>
> = {
    "194": [
        {
            delivery_kind: "RAW_MATERIAL",
            nomenclature_name: "F-UPF 12 mc 1165 mm",
            requested_quantity: 16800,
            quantity_uom: "KGM",
            nomenclature_code: "290A01-0001-0009",
            semi_finished_pick_required: false,
        },
        {
            delivery_kind: "RAW_MATERIAL",
            nomenclature_name: "Плёнка BOPP прозрачная 20 мкм",
            requested_quantity: 85,
            quantity_uom: "KGM",
            nomenclature_code: "CP0002",
            semi_finished_pick_required: true,
        },
    ],
    "46": [
        {
            delivery_kind: "RAW_MATERIAL",
            nomenclature_name: "F-UPF 12 mc 1165 mm",
            requested_quantity: 16800,
            quantity_uom: "KGM",
            nomenclature_code: "290A01-0001-0009",
            semi_finished_pick_required: false,
        },
    ],
};

const DEFAULT_MOCK_COMPOSE_LINES = [
    {
        delivery_kind: "RAW_MATERIAL",
        nomenclature_name: "F-UPF 12 mc 1165 mm",
        requested_quantity: 16800,
        quantity_uom: "KGM",
        nomenclature_code: "290A01-0001-0009",
        semi_finished_pick_required: false,
    },
    {
        delivery_kind: "RAW_MATERIAL",
        nomenclature_name: "Клей растворимый дисперсионный",
        requested_quantity: 40,
        quantity_uom: "KGM",
        nomenclature_code: "CP0003",
        semi_finished_pick_required: false,
    },
];

export function buildMockMaterialOrderComposeResponse(workAreaIds: string) {
    const ids = workAreaIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (ids.length === 0) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaIds",
                compose_session_id: "",
                pick_toggle_enabled: false,
                result: [],
            },
        ];
    }

    if (ids.length > 3) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Можно выбрать не более 3 этапов",
                compose_session_id: "",
                pick_toggle_enabled: false,
                result: [],
            },
        ];
    }

    const sessionSuffix = ids.join("-");
    let lineNo = 1;

    const result = ids.flatMap((workAreaId) => {
        const templates = MOCK_COMPOSE_LINES_BY_WORK_AREA[workAreaId] ?? DEFAULT_MOCK_COMPOSE_LINES;

        return templates.map((template) => {
            const line = {
                delivery_kind: template.delivery_kind,
                nomenclature_name: template.nomenclature_name,
                work_area_id: workAreaId,
                requested_quantity: template.requested_quantity,
                quantity_uom: template.quantity_uom,
                line_no: lineNo,
                nomenclature_code: template.nomenclature_code,
                semi_finished_pick_required: template.semi_finished_pick_required,
                material_roll_ids: [] as string[],
                series_ref: "",
                lot_refs: [] as string[],
            };
            lineNo += 1;
            return line;
        });
    });

    const pickToggleEnabled = result.some((line) => line.semi_finished_pick_required);

    return [
        {
            error_code: "OK",
            error_message: "",
            compose_session_id: `CMP-${sessionSuffix}`,
            pick_toggle_enabled: pickToggleEnabled,
            result,
        },
    ];
}

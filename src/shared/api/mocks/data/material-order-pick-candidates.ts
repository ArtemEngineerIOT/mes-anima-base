export function buildMockMaterialOrderPickCandidatesResponse(workAreaId: string) {
    if (!workAreaId.trim()) {
        return [
            {
                error_code: "VALIDATION",
                error_message: "Укажите workAreaId",
                result: [],
            },
        ];
    }

    return [
        {
            error_code: "OK",
            error_message: "",
            result: [
                {
                    lot_ref: "L-8890-A",
                    nomenclature_code: "CP0002",
                    nomenclature_name: "Плёнка BOPP прозрачная 20 мкм",
                    available_quantity: 1,
                    quantity_uom: "рул",
                    expires_at: "2027-01-15",
                    blocked: false,
                },
                {
                    lot_ref: "L-8890-B",
                    nomenclature_code: "CP0002",
                    nomenclature_name: "Плёнка BOPP прозрачная 20 мкм",
                    available_quantity: 1,
                    quantity_uom: "рул",
                    expires_at: "2027-02-01",
                    blocked: false,
                },
                {
                    lot_ref: "L-7701",
                    nomenclature_code: "CP0002",
                    nomenclature_name: "Плёнка BOPP прозрачная 20 мкм",
                    available_quantity: 1,
                    quantity_uom: "рул",
                    expires_at: "2026-12-20",
                    blocked: true,
                },
            ],
        },
    ];
}

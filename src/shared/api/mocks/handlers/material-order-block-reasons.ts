import { http, HttpResponse } from "msw";

import { MOCK_LIST_BLOCK_REASONS_RESPONSE } from "../data/material-order-block-reasons";

export const materialOrderBlockReasonsHandlers = [
    http.post("/v1/contexts/users.admin.models.rest/functions/listBlockReasons", async () => {
        return HttpResponse.json(MOCK_LIST_BLOCK_REASONS_RESPONSE);
    }),
];

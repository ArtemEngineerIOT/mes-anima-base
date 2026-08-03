export function buildMockClientGetEnvironmentResponse(operatorRef: string) {
    const normalizedOperatorRef = operatorRef.trim();
    if (!normalizedOperatorRef) {
        return [];
    }

    return [
        {
            clientLogin: normalizedOperatorRef,
            tempFilesFolder: "f9d7d250-675a-4eac-985f-afc36fa11a13",
            clientTimeZone: "4",
        },
    ];
}

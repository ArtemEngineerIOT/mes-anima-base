export function useRegister() {
    return {
        register: ({ username, password, email }: { username: string; password: string; email?: string }) => {
            void username;
            void password;
            void email;
            throw new Error("Register endpoint is not defined in OpenAPI schema yet.");
        },
        isPending: false,
        errorMassage: undefined as string | undefined,
    };
}
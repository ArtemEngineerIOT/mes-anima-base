export type Role = "system" | "operator" | "manager" | "admin";

export const ROLES: Record<Role, Role> = {
    system: "system",
    operator: "operator",
    manager: "manager",
    admin: "admin",
};

export function normalizeRole(role: string | undefined | null): Role | null {
    if (!role) return null;
    if (role === "system" || role === "operator" || role === "manager" || role === "admin") return role;
    return null;
}

export function hasRoleAccess(userRole: Role | null, allowed: readonly Role[] | "any"): boolean {
    if (allowed === "any") return true;
    if (!userRole) return false;
    if (userRole === "system") return true;
    return allowed.includes(userRole);
}

import type { ApiSchemas } from "@/shared/api/schema";
import { normalizeRole, type Role } from "@/shared/model/roles";

export type MesUserProfileRow = ApiSchemas["MesUserProfileRow"];
export type MesUserProfileResponse = ApiSchemas["MesUserProfileResponse"];

/** Профиль сотрудника из bootstrap. */
export type MesBootstrapProfile = {
    userAccountId: string;
    employeeId: string;
    fio: string;
    position: string;
    positionCode: string;
    appRoleCodesRaw: string;
};

/** Роль UI и коды app_roles. */
export type MesBootstrapAccess = {
    uiRole: Role;
    appRoleCodes: string[];
};

/** Допуски к resource_code (UC-SM-02). */
export type MesBootstrapResourceRights = {
    allowedResourceCodes: string[];
    rightsLoadOutcome: string;
    rightsLoadCode: string;
    rightsLoadMessage: string;
    /** true, если rights_load_outcome === FAILED */
    rightsLoadFailed: boolean;
};

/** Единый кэш ответа mesUserProfile. */
export type MesBootstrap = {
    profile: MesBootstrapProfile;
    access: MesBootstrapAccess;
    resourceRights: MesBootstrapResourceRights;
};

/** @deprecated Используйте MesBootstrapProfile */
export type MesUserProfile = MesBootstrapProfile;

const APP_ROLE_CODE_TO_UI: Record<string, Role> = {
    SYSTEM: "system",
    OPERATOR: "operator",
    SHIFT_OPERATOR: "operator",
    TECHNOLOGIST: "operator",
    MANAGER: "manager",
    SHIFT_MANAGER: "manager",
    ADMIN: "admin",
};

const POSITION_CODE_TO_UI: Record<string, Role> = {
    OPERATOR: "operator",
    MANAGER: "manager",
    ADMIN: "admin",
    SYSTEM: "system",
};

export function parseCommaSeparatedCodes(value: string | null | undefined): string[] {
    if (!value?.trim()) {
        return [];
    }
    return value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function mapCodeToUiRole(code: string): Role | null {
    const upper = code.trim().toUpperCase();
    return APP_ROLE_CODE_TO_UI[upper] ?? POSITION_CODE_TO_UI[upper] ?? normalizeRole(code.trim().toLowerCase());
}

function pickUiRoleFromRow(row: MesUserProfileRow): Role | null {
    const appRoleCodes = row.app_role_codes?.trim();
    if (appRoleCodes) {
        for (const code of appRoleCodes.split(",")) {
            const mapped = mapCodeToUiRole(code);
            if (mapped) {
                return mapped;
            }
        }
    }

    const positionCode = row.position_code?.trim();
    if (positionCode) {
        return mapCodeToUiRole(positionCode);
    }

    return null;
}

function assertProfileOutcome(row: MesUserProfileRow): void {
    const outcome = row.outcome?.trim();
    if (!outcome) {
        throw new Error("Некорректный ответ сервера: не указан outcome");
    }

    if (outcome !== "SUCCESS") {
        const message = row.message?.trim();
        throw new Error(message || "Не удалось загрузить профиль MES");
    }
}

function buildResourceRights(row: MesUserProfileRow): MesBootstrapResourceRights {
    const rightsLoadOutcome = row.rights_load_outcome?.trim() ?? "";
    const rightsLoadFailed = rightsLoadOutcome === "FAILED";

    return {
        allowedResourceCodes: rightsLoadFailed ? [] : parseCommaSeparatedCodes(row.allowed_resource_codes),
        rightsLoadOutcome,
        rightsLoadCode: row.rights_load_code?.trim() ?? "",
        rightsLoadMessage: row.rights_load_message?.trim() ?? "",
        rightsLoadFailed,
    };
}

/** Проверка допуска к машине по кэшу bootstrap (локально, без RPC). */
export function canAccessResource(resourceCode: string, bootstrap: MesBootstrap | undefined): boolean {
    if (!bootstrap || bootstrap.resourceRights.rightsLoadFailed) {
        return false;
    }
    const code = resourceCode.trim();
    if (!code) {
        return false;
    }
    return bootstrap.resourceRights.allowedResourceCodes.includes(code);
}

/** Парсит ответ RPC `mesUserProfile`: outcome → роль → профиль → права. */
export function resolveMesUserProfileFromResponse(
    payload: MesUserProfileResponse | undefined,
): MesBootstrap {
    const row = payload?.[0];
    if (!row) {
        throw new Error("Пустой ответ сервера");
    }

    assertProfileOutcome(row);

    const uiRole = pickUiRoleFromRow(row);
    if (!uiRole) {
        const hint = row.app_role_codes || row.position_code;
        throw new Error(hint ? `Роль «${hint}» не поддерживается` : "Роль пользователя не определена");
    }

    const appRoleCodesRaw = row.app_role_codes?.trim() ?? "";

    return {
        profile: {
            userAccountId: row.user_account_id ?? "",
            employeeId: row.employee_id ?? "",
            fio: row.fio ?? "",
            position: row.position ?? "",
            positionCode: row.position_code ?? "",
            appRoleCodesRaw,
        },
        access: {
            uiRole,
            appRoleCodes: parseCommaSeparatedCodes(appRoleCodesRaw),
        },
        resourceRights: buildResourceRights(row),
    };
}

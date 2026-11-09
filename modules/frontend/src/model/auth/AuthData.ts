export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    RESP_MARKETING = "RESP_MARKETING",
    MARKETING = "MARKETING",
    RESP_ATT_ALUMNO = "RESP_ATT_ALUMNO",
    ATT_ALUMNO = "ATT_ALUMNO",
    USER = "USER",
    COACH_HEBREO = "COACH_HEBREO",
    COACH_MENTORIA = "COACH_MENTORIA",
    VENTAS = "VENTAS"
}

export enum FeatureFlag {
    ADMIN_PANEL,
}

export type AuthData = {
    accessToken: string;
    roles: Role[];
    userId: number;
};

export interface RoleDescription {
    role: Role;
    description: string;
}
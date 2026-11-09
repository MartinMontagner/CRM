import { Role, RoleDescription } from "../auth/AuthData";

// Actualización del tipo WazendInstanceDTO para incluir roles
export interface WazendInstanceDTO {
  id: number;
  name: string;
  apiKey: string;
  instance: string;
  server: string;
  roles: string[]; // Nuevo campo para los roles
  createdAt?: string;
  updatedAt?: string;
  
}
export interface WazendCreateInstanceDTO {
  name: string;
  apiKey: string;
  instance: string;
  server: string;
  roles: string[]; // Nuevo campo para los roles
}

// Tipo para la creación de instancias
export type WazendInstanceCreateData = Omit<
  WazendInstanceDTO,
  "id" | "createdAt" | "updatedAt"
>;

// Tipo para la actualización de instancias
export type WazendInstanceUpdateData = {
  id: number;
} & Partial<Omit<WazendInstanceDTO, "id" | "createdAt" | "updatedAt">>;

// Si necesitas mapear los roles del enum a strings, puedes usar esta función:
export const mapRoleEnumToString = (role: Role): string => {
  const roleMap: Record<Role, string> = {
    [Role.SUPER_ADMIN]: "SUPER_ADMIN",
    [Role.ADMIN]: "ADMIN",
    [Role.RESP_MARKETING]: "RESP_MARKETING",
    [Role.MARKETING]: "MARKETING",
    [Role.RESP_ATT_ALUMNO]: "RESP_ATT_ALUMNO",
    [Role.ATT_ALUMNO]: "ATT_ALUMNO",
    [Role.USER]: "USER",
    [Role.COACH_HEBREO]: "COACH_HEBREO",
    [Role.COACH_MENTORIA]: "COACH_MENTORIA",
    [Role.VENTAS]: "VENTAS",
  };

  return roleMap[role];
};

// Y esta función para el mapeo inverso:
export const mapStringToRoleEnum = (roleString: string): Role => {
  const roleMap: Record<string, Role> = {
    SUPER_ADMIN: Role.SUPER_ADMIN,
    ADMIN: Role.ADMIN,
    RESP_MARKETING: Role.RESP_MARKETING,
    MARKETING: Role.MARKETING,
    RESP_ATT_ALUMNO: Role.RESP_ATT_ALUMNO,
    ATT_ALUMNO: Role.ATT_ALUMNO,
    USER: Role.USER,
  };

  return roleMap[roleString];
};

export const getRoleDescription = (roleString: string, rolesData: RoleDescription[]): string => {
    const roleDesc = rolesData?.find(role => role.role.toString() === roleString);
    return roleDesc?.description || roleString;
  };

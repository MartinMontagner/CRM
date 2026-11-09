// src/model/user/Roles.ts

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  RESP_MARKETING = "RESP_MARKETING",
  MARKETING = "MARKETING",
  RESP_ATT_ALUMNO = "RESP_ATT_ALUMNO",
  ATT_ALUMNO = "ATT_ALUMNO",
  COACH_HEBREO = "COACH_HEBREO",
  COACH_MENTORIA = "COACH_MENTORIA",
  VENTAS = "VENTAS",
  USER= "USER", 
}

export const roleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Administrador",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.RESP_MARKETING]: "Responsable de Marketing",
  [UserRole.MARKETING]: "Marketing",
  [UserRole.RESP_ATT_ALUMNO]: "Responsable de Atención al Alumno",
  [UserRole.ATT_ALUMNO]: "Atención al Alumno",
  [UserRole.COACH_HEBREO]: "Coach Hebreo",
  [UserRole.COACH_MENTORIA]: "Coach de Mentoría",
  [UserRole.VENTAS]: "Ventas",
  [UserRole.USER]: "Usuario General",
};
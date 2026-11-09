
export interface SupervisorDTO {
    id: number;
    name: string;
    role: string;
    locationName?: string;
    supervisorDependenciaName?: string;
}

export interface SupervisorRequestDTO {
    name: string;
    role: string;
    locationId?: number;
    supervisorDependenciaId?: number;
}
export interface MensajeDTO {
    id: number;
    codigo: string;
    texto: string;
    idioma: string;
    contexto: string;
    categoria: string;
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface MensajeUpdateDTO {
    texto?: string;
    activo?: boolean;
}
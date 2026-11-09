import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { IdentityValidationRequestDTO, IdentityValidationResponseDTO, WorkerDocumentDTO, WorkerDTO, WorkerRequestDTO } from "@/model/worker/Worker";

const client = createRefreshTokenHttpClient("/workers");

export interface FilterCondition {
    field: string;
    value: string;
    operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            empty: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    number: number;
    size: number;
    numberOfElements: number;
    sort: {
        sorted: boolean;
        empty: boolean;
        unsorted: boolean;
    };
    empty: boolean;
}

// Para resultados no filtrados (paginación tradicional)
export const getWorkers = async (
    page: number,
    pageSize: number
): Promise<PaginatedResponse<WorkerDTO>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', pageSize.toString());

        const response = await client.get<PaginatedResponse<WorkerDTO>>('', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching workers');
    }
};

// Para resultados filtrados (carga progresiva)
export const getFilteredWorkers = async (
    filters: FilterCondition[],
    page: number,
    pageSize: number = 100 // Tamaño de lote mayor para filtrados
): Promise<PaginatedResponse<WorkerDTO>> => {
    try {
        const params = new URLSearchParams();

        filters.forEach(filter => {
            params.append(filter.field, filter.value);
        });

        params.append('page', page.toString());
        params.append('size', pageSize.toString());

        const response = await client.get<PaginatedResponse<WorkerDTO>>('/filter', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching filtered workers');
    }
};

export const getCandidates = async (
    page: number,
    pageSize: number
): Promise<PaginatedResponse<WorkerDTO>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', pageSize.toString());

        const response = await client.get<PaginatedResponse<WorkerDTO>>('/candidates', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching workers');
    }
};

// Para resultados filtrados (carga progresiva)
export const getFilteredCandidates = async (
    filters: FilterCondition[],
    page: number,
    pageSize: number = 100 // Tamaño de lote mayor para filtrados
): Promise<PaginatedResponse<WorkerDTO>> => {
    try {
        const params = new URLSearchParams();

        filters.forEach(filter => {
            params.append(filter.field, filter.value);
        });

        params.append('page', page.toString());
        params.append('size', pageSize.toString());

        const response = await client.get<PaginatedResponse<WorkerDTO>>('/filter/candidates', { params });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching filtered workers');
    }
};

export const getWorkerById = async (id: number): Promise<WorkerDTO> => {
    const res = await client.get<WorkerDTO>(`/${id}`);
    if (res.status === 200) {
        return res.data;
    }
    throw res;
};

export const createWorker = async (worker: WorkerRequestDTO) => {
    const formData = new FormData();

    Object.entries(worker).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        }
    });

    const res = await client.post<WorkerDTO>("", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    if (res.status === 201) {
        return res.data;
    }
    throw res;
};

export const updateWorker = async (id: number, worker: Partial<WorkerRequestDTO>): Promise<WorkerDTO> => {
    // Verificación exhaustiva del ID
    console.log("updateWorker recibió ID:", id, "tipo:", typeof id);

    // Convertir a número si viene como string
    const workerId = typeof id === 'string' ? parseInt(id, 10) : id;

    // Validación exhaustiva de parámetros
    if (!workerId || isNaN(workerId) || workerId <= 0) {
        console.error("ID inválido:", id, "convertido a:", workerId);
        throw new Error("ID de trabajador no válido");
    }

    if (!worker || typeof worker !== 'object' || Object.keys(worker).length === 0) {
        throw new Error("Datos del trabajador no proporcionados o inválidos");
    }

    const formData = new FormData();
    try {
        // Agregar ID al formData
        formData.append('id', workerId.toString());

        // Procesar cada campo del worker
        Object.entries(worker).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        console.log("Datos enviados al servidor:", Array.from(formData.entries()));

        // Asegurarse de que el ID esté presente en la URL y como parte de los datos
        const res = await client.put<WorkerDTO>(`/${workerId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });

        if (res.status === 200) {
            return res.data;
        } else {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
    } catch (error) {
        console.error("Error en updateWorker:", error);
        throw new Error(`Error al actualizar trabajador: ${error instanceof Error ? error.message : String(error)}`);
    }
};


export const deleteWorkers = async (ids: number[]) => {
    const results = await Promise.all(ids.map((id) => deleteWorker(id)));
    return results.every((result) => result === true);

};

export const deleteWorker = async (id: number) => {
    const res = await client.delete<void>(`/${id}`);
    if (res.status === 204) {
        return true;
    }
    throw res;
};

export const getPendingValidationWorkers = async (): Promise<WorkerDocumentDTO[]> => {
    try {
        const response = await client.get<WorkerDocumentDTO[]>("/pending-validation");
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    } catch (error) {
        console.error("Error obteniendo trabajadores pendientes de validación:", error);
        throw error;
    }
};

export const validateWorkerIdentity = async (
    workerId: number,
    validationData: IdentityValidationRequestDTO
): Promise<IdentityValidationResponseDTO> => {
    const res = await client.post<IdentityValidationResponseDTO>(
        `/${workerId}/validate-identity`,
        validationData
    );

    if (res.status === 200) {
        return res.data;
    }
    throw res;
};

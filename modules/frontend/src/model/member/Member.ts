import { ChatStatus, Tags } from "@/types/types";

/**
 * DTO que representa la vista combinada de miembros y sus suscripciones
 */
export interface MemberSubscriptionViewDTO {
  /**
   * Identificador del miembro
   */
  id: number;
  /**
   * Email del miembro (clave primaria)
   */
  email: string;

  /**
   * Nombre del miembro
   */
  firstName: string;

  /**
   * Apellido del miembro
   */
  lastName: string;

  /**
   * Número de teléfono del miembro
   */
  phone: string;

  /**
   * Estado de la suscripción (active, cancelled, etc.)
   */
  status: string | null;

  /**
   * Nombre del producto suscrito
   */
  productName: string | null;

  /**
   * País del miembro
   */
  addressCountry: string | null;

  /**
   * Fecha de registro del miembro
   */
  registered: string | null;

  /**
   * Cantidad de transacciones activas del miembro
   */
  activeTxnCount: string | null;

  /**
   * Cantidad de transacciones expiradas del miembro
   */
  expiredTxnCount: number | null;

  /**
   * Fecha de la transacción reciente del miembro
   */
  latestTxnDate: string | null;

  /**
   * Fecha del ultimo login del miembro
   */
  lastLoginDate: string | null;
  /**
   * Listado de suscripciones del miembro
   */
  subscriptions: object[] | null;

  chat: ChatStatus | null;

  category: Tags | null;
}

/**
 * Interfaz para filtrar resultados
 */
export interface FilterCondition {
  field: string;
  value: string;
  operator?:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan";
}

/**
 * Respuesta paginada desde el backend
 */
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

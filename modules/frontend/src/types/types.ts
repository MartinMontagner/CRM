// types.ts
import { MemberSubscriptionViewDTO } from "@/model/member/Member";
import { ProductType, StatusMember } from "@/utils/selectEnums";
import countries from "@/utils/json/countries.json";

// Define interfaces for filters and table data
export interface Filter {
  field: string;
  value: string;
}

// Use the existing DTO type as a base for our interface
export interface MemberSubscription
  extends Omit<MemberSubscriptionViewDTO, "status"> {
  //chat: ChatStatus;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressCountry: string;
  registered: string;
  activeTxnCount: string;
  expiredTxnCount: number;
  latestTxnDate: string;
  lastLoginDate: string;
  subscriptions: object[];
  category: Tags | null;
  [key: string]: any;
}

// Define tipos de ordenamiento
export type SortDirection = "asc" | "desc" | null;
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Constants for field definitions
export const FIELDS = [
  /*"chat",*/
  "firstName",
  "lastName",
  "email",
  "addressCountry",
  "subscriptions",
  "activeTxnCount",
  "expiredTxnCount",
  "phone",
  "latestTxnDate",
  "lastLoginDate",
  "registered",
  "category",
];

// Nombres de visualización para los campos
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  /*chat: "Chat",*/
  email: "Email",
  firstName: "Nombre",
  lastName: "Apellido",
  phone: "Teléfono",
  addressCountry: "País",
  subscriptions: "Producto",
  activeTxnCount: "Transacciones activas",
  status: "Estado",
  expiredTxnCount: "Transacciones expiradas",
  latestTxnDate: "Última transacción",
  lastLoginDate: "Último inicio de sesión",
  registered: "Fecha de registro",
  category: "Categoría",
};

export enum Tags {
  ALUMNO = "ALUMNO",
  EX_ALUMNO = "EX_ALUMNO",
}

export enum ChatStatus {
  READ = "READ",
  UNREAD = "UNREAD",
  ANSWERED = "ANSWERED",
}

export const ChatStatusTag = {
  READ: "Leído",
  UNREAD: "Sin leer",
  ANSWERED: "Respondido",
};

export const getChatStatus = (type: string) => {
  switch (type) {
    case "READ":
      return ChatStatus.READ;
    case "UNREAD":
      return ChatStatus.UNREAD;
    case "ANSWERED":
      return ChatStatus.ANSWERED;
    default:
      return ChatStatus.UNREAD;
  }
};

export interface FilterTag extends Filter {
  id: string;
}

interface ContentFilterField {
  original: string[];
  content: string[];
}

export const SelectFilterFields: Record<string, ContentFilterField> = {
  chat: {
    original: Array.from(Object.keys(ChatStatusTag)),
    content: Array.from(Object.values(ChatStatusTag)),
  },
  category: {
    original: Array.from(Object.keys(Tags)),
    content: [ "Alumno", "Ex Alumno"], 
  },
  status: {
    original: Array.from(Object.keys(StatusMember)),
    content: Array.from(Object.values(StatusMember)),
  },
  addressCountry: {
    original: countries.map((country) => country.name.trim()),
    content: countries.map((country) =>
      country.name.trim().length > 10
        ? country.name.trim().slice(0, 10) + "..."
        : country.name.trim()
    ),
  },
   activeTxnCount: {
    content: ["Con Acceso", "Sin Acceso"],
    original: ["Con Acceso", "Sin Acceso"]
  },
  subscriptions: {
    original: ProductType,
    content: ProductType,
  },
};

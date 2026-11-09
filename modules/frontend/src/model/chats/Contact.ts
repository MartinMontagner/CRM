export interface ContactInfo {
  conversationId: number;
  email: string;
  firstName: string;
  lastName: string;
  telefono: string;
  status: string | null;
  productName: string | null;
  addressCountry: string;
  interestTag: string | null;
  labels: string[];
  subscription: string | null;
  activeTxnCount: string | null;
  expiredTxnCount: number | null;
  latestTxnDate: string | null;
  lastLoginDate: string | null;
  refacturacion: string | null;
  registered: string | null;
  note: string | null;
  customTags: CustomTag[] | null;
}

export interface CustomTag {
  id: number
  name: string
  color: string
  enabled: boolean
  studentTag: string
  important: boolean
  dark: boolean
}
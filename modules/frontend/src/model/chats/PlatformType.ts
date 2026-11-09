export type PlatformType = 'ALL' | 'WHATSAPP' | 'WAZEND' | 'WAZEND_GROUP';

export enum Platform {
  ALL = 'ALL',
  WHATSAPP = 'WHATSAPP',
  WAZEND = 'WAZEND',
  WAZEND_GROUP = 'WAZEND_GROUP'
}
export enum PlatformTypeBackend {
  WHATSAPP = 'WHATSAPP',
  WAZEND = 'WAZEND',
  WAZEND_GROUP = 'WAZEND_GROUP'
}

export const platformTypeToBackend = (platform: PlatformType): PlatformTypeBackend | undefined => {
  switch (platform) {
    case 'WHATSAPP':
      return PlatformTypeBackend.WHATSAPP;
    case 'WAZEND':
      return PlatformTypeBackend.WAZEND;
    case 'WAZEND_GROUP':
      return PlatformTypeBackend.WAZEND_GROUP;
    case 'ALL':
      return undefined; // ALL no tiene un equivalente en el backend
    default:
      return undefined; // Manejo de caso no esperado
  }
}
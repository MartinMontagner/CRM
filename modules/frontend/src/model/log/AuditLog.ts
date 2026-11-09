export interface AuditLogDTO {
    id: number;
    userName: string;
    action: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}
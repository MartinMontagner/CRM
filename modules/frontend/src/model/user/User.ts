export type User = {
    id: number;
    username: string;
    email: string;
    name: string;
    imageUrl: string;
    enabled?: boolean;
    role?:string;
    disabled?: boolean;
};

export interface CountApproved {
    count: number;
}
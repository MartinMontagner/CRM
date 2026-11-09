import { UserRole } from './Roles';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
}
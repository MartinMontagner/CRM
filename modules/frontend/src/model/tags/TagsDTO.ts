export class CreateCustomTagDTO {
  name!: string; // Name cannot be blank
  color!: string; // Color cannot be blank and must match hex format (#FFFFFF or #FFF)
  studentTag!: 'LEAD' | 'ALUMNO' | 'EX_ALUMNO'; // Must be one of the allowed enum values
  important!: boolean; // Important status cannot be null
}
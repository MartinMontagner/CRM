export interface WorkerDTO {
    // Datos básicos
    id: number;
    name: string;
    surname1: string;
    surname2: string;
    dni: string;
    birthDate: string;
    sex: string;
    maritalStatus: string;
    nationality: string;
    countryOfWork: string;
    disabilityDegree: string;

    // Dirección
    streetType: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    birthCity: string;
    birthProvince: string;
    birthCountry: string;

    // Contacto
    phone: string;
    email: string;

    // Datos laborales
    company: string;
    companyCif: string;
    companySocialSecurity: string;
    workSection: string;
    workSectionDescription: string;
    socialSecurity: string;
    educationLevel: string;
    category: string;
    categoryDescription: string;
    jobPosition: string;
    cotizationGroup: string;
    registrationNumber: string;
    workCenter: string;
    workCalendar: string;
    collectiveAgreement: string;

    // Contrato
    contractNumber: string;
    contractType: string;
    contractEndDate: string;
    partTimeSchedule: string;
    isPartTime: boolean;
    specialSystemCoefficient: string;
    guaranteedMinimum: string;

    // Datos sindicales
    union: string;
    unionFee: string;

    // Datos económicos
    paymentMethod: string;
    paymentType: string;
    irpfPercentage: string;
    hourlyRate: string;
    daytimeOvertimeRate: string;
    nighttimeOvertimeRate: string;
    specialOvertimeRate: string;
    bankAccount: string;
    iban: string;
    bic: string;

    // Seguridad Social
    socialSecurityRegime: string;
    socialSecurityRegimeRED: string;
    specialSystemCotizationType: string;
    baseTypeCode: string;
    baseTypeDescription: string;

    // Documentación
    permitExpiryDate: string;
    workPermitEndDate: string;
    agreedConditionsExpiry: string;
    medicalCheckup: string;
    dniFrontImgUrl: string;
    dniBackImgUrl: string;
    selfieImgUrl: string;
    ssImgUrl: string;

    // Situación laboral
    hireDate: string;
    seniorityDate: string;
    terminationDate: string;
    terminationCode: string;
    terminationReason: string;
    extensionStartDate: string;
    extensionEndDate: string;

    // Otros
    otherDocumentsText: string;
    companyPresence: string;
    presenceCode: string;
    extraInfo: string;
    extraImgUrl: string[];
    recruitmentStatus: string;

    // Flags
    termsAccepted: boolean;
    previousCampaign: boolean;
    finalized: boolean;
    identityValidated: boolean;
    fromCSV: boolean;
    pregnant: boolean;

    // Relaciones
    jobType: string;
    locationName: string;
    positionName: string;
    categoryType: string;
    employmentType: string;
    jefeCuadrillaName: string;
    encargadoName: string;
    jefeLineaName: string;
}

export enum EmploymentType {
    CANDIDATO = "CANDIDATO",
    FIJO_DISCONTINUO = "FIJO_DISCONTINUO"
}

export interface WorkerRequestDTO {
    name: string;
    surname1: string;
    surname2: string;
    dni: string;
    sex: string;
    nationality: string;
    permitExpiryDate: string;
    birthDate: string;
    birthCity: string;
    birthCountry: string;
    partTimeSchedule: string;
    address: string;
    city: string;
    province: string;
    socialSecurity: string;
    phone: string;
    email: string;

    // Renamed relation IDs to match backend
    locationId: number | null;
    positionId: number | null; // Changed from puestoId
    encargadoId: number | null; // Changed from supervisorId
    jefeLineaId: number | null; // Changed from lineManagerId
    jefeCuadrillaId: number | null;

    // Document uploads
    dniFrontImg: File | null;
    dniBackImg: File | null;
    selfieImg: File | null;
    ssImg: File | null;
    
    // New field for employment type
    employment: EmploymentType | null;
}

export interface WorkerDocumentDTO {
    id: number;
    name: string;
    surname1: string;
    surname2: string;
    dni: string;
    social_security: string;
    dni_front_img_url: string;
    dni_back_img_url: string;
    ss_img_url: string;
    selfie_img_url: string;
}

export interface IdentityValidationRequestDTO {
    valid: boolean;
    validatedBy: string;
    comments?: string;
}

export interface IdentityValidationResponseDTO {
    workerId: number;
    validated: boolean;
    message: string;
}

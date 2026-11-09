// Interfaces para las plantillas de WhatsApp

export interface TemplateComponent {
    type: string;
    format?: string;
    text?: string;
    example?: {
        body_text_named_params?: {
            param_name: string;
            example: string;
        }[];
    };
}

export interface WhatsAppTemplate {
    name: string;
    parameter_format: string;
    components: TemplateComponent[];
    language: string;
    status: string;
    category: string;
    id: string;
}

export interface TemplateParam {
    name: string;
    value: string;
    example?: string;
    type?: string;
    isReadOnly?: boolean;
}

export interface SendTemplateRequest {
    template: string;
    params: string[];
    phoneNumber: number;
    language: string;
    paramNames?: string[];
    paramTypes?: string[];
}

export interface TemplatesResponse {
    data: WhatsAppTemplate[];
    paging: {
        cursors: {
            before: string;
            after: string;
        };
    };
}

export interface SendMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    phoneNumber?: number;
}
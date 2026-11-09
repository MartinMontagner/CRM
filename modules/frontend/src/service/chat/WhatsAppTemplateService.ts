import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { SendTemplateRequest, TemplateParam, TemplatesResponse, WhatsAppTemplate } from "@/model/chats/Template";


/**
 * Servicio para manejar las operaciones relacionadas con plantillas de WhatsApp
 */
export const WhatsAppTemplateService = {
    /**
     * Obtiene todas las plantillas disponibles de WhatsApp
     * @returns Promise con la respuesta de plantillas
     */
    fetchTemplates: async (): Promise<WhatsAppTemplate[]> => {
        try {
            const client = createRefreshTokenHttpClient("/chats");
            const response = await client.get<TemplatesResponse>("/templates");
            return response.data.data || [];
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            throw error;
        }
    },

    /**
     * Envía una plantilla de WhatsApp a un número de teléfono
     * @param request Datos para enviar la plantilla
     * @returns Promise con el resultado del envío
     */
    sendTemplate: async (request: SendTemplateRequest): Promise<Record<string, unknown>> => {
        try {
            const client = createRefreshTokenHttpClient("/chats");
            console.log("Enviando solicitud:", JSON.stringify(request, null, 2));
            const response = await client.post("/send-bulk-template", request);
            return response.data;
        } catch (error) {
            console.error("Error al enviar mensajes:", error);
            throw error;
        }
    },

    /**
     * Extrae los parámetros de una plantilla de WhatsApp
     * @param template Plantilla de WhatsApp
     * @returns Lista de parámetros extraídos
     */
    extractTemplateParams: (template: WhatsAppTemplate): TemplateParam[] => {
        const params: TemplateParam[] = [];

        // Comprueba el formato de parámetros
        if (template.parameter_format === "NAMED") {
            // Busca los parámetros nombrados en los ejemplos de los componentes
            template.components.forEach(component => {
                if (component.example?.body_text_named_params) {
                    component.example.body_text_named_params.forEach(param => {
                        params.push({
                            name: param.param_name,
                            value: "",
                            example: param.example,
                            type: "text" // Por defecto, asumimos tipo texto
                        });
                    });
                }
            });

            // Si no hay ejemplos, intenta extraer los nombres de parámetros del texto
            if (params.length === 0) {
                template.components.forEach(component => {
                    if (component.text) {
                        const matches = component.text.match(/{{([^}]+)}}/g);
                        if (matches) {
                            matches.forEach(match => {
                                const paramName = match.replace(/{{|}}/g, '');
                                // Evita duplicados
                                if (!params.some(p => p.name === paramName)) {
                                    params.push({
                                        name: paramName,
                                        value: "",
                                        example: undefined,
                                        type: "text"
                                    });
                                }
                            });
                        }
                    }
                });
            }

            // Si aún no encontramos parámetros y hay texto, podría ser una plantilla que
            // usa placeholders sin el formato {{nombre}} estándar
            if (params.length === 0) {
                const bodyComponent = template.components.find(c => c.type === "BODY");
                if (bodyComponent?.text) {
                    // Buscar palabras que podrían ser parámetros (en mayúsculas o con formato especial)
                    const potentialParams = bodyComponent.text.match(/\b[A-Z]{2,}\b/g);
                    if (potentialParams) {
                        potentialParams.forEach(param => {
                            // Convertir a formato más legible
                            const readableName = param.toLowerCase();
                            params.push({
                                name: readableName,
                                value: "",
                                example: undefined
                            });
                        });
                    }
                }
            }
        } else {
            // Para parámetros posicionales (POSITIONAL)
            template.components.forEach(component => {
                if (component.text) {
                    // Busca coincidencias como {{1}}, {{2}}, etc.
                    const matches = component.text.match(/{{\d+}}/g);
                    if (matches) {
                        // Ordena los índices numéricamente
                        const uniqueMatches = [...new Set(matches)].sort((a, b) => {
                            const numA = parseInt(a.replace(/{{|}}/g, ''));
                            const numB = parseInt(b.replace(/{{|}}/g, ''));
                            return numA - numB;
                        });

                        uniqueMatches.forEach((match) => {
                            const paramNumber = match.replace(/{{|}}/g, '');
                            params.push({
                                name: `Parámetro ${paramNumber}`,
                                value: "",
                                example: undefined,
                                type: "text" // Por defecto, asumimos tipo texto
                            });
                        });
                    }
                }
            });
        }

        return params;
    },

    /**
     * Genera una vista previa de una plantilla con los valores actuales
     * @param template Plantilla de WhatsApp
     * @param templateParams Parámetros con sus valores
     * @returns String con la vista previa
     */
    getTemplatePreview: (template: WhatsAppTemplate, templateParams: TemplateParam[]): string => {
        if (!template) return "";

        const header = template.components.find(c => c.type === "HEADER")?.text || "";
        let body = template.components.find(c => c.type === "BODY")?.text || "";
        const footer = template.components.find(c => c.type === "FOOTER")?.text || "";

        // Reemplazar los parámetros con sus valores actuales si están disponibles
        templateParams.forEach(param => {
            if (param.value.trim()) {
                if (template.parameter_format === "NAMED") {
                    body = body.replace(new RegExp(`{{${param.name}}}`, 'g'), param.value);
                } else {
                    // Para parámetros posicionales, extraer el número del nombre (ej: "Parámetro 1" -> "1")
                    const paramNum = param.name.match(/\d+/);
                    if (paramNum) {
                        body = body.replace(new RegExp(`{{${paramNum[0]}}}`, 'g'), param.value);
                    }
                }
            }
        });

        return `Idioma: ${template.language.toUpperCase()}\n\n${header}\n\n${body}\n\n${footer}`;
    }
};
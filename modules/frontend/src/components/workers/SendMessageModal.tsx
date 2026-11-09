import { createRefreshTokenHttpClient } from "@/client/HttpClient";
import { Button, Group, LoadingOverlay, Modal, Select, Stack, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TemplateComponent {
    type: string;
    format?: string;
    text?: string;
}

interface WhatsAppTemplate {
    name: string;
    parameter_format: string;
    components: TemplateComponent[];
    language: string;  // <-- Ya existe en tu interfaz
    status: string;
    category: string;
    id: string;
}

interface SendTemplateRequest {
    template: string;
    params: string[];
    phoneNumbers: number[];
    language: string;  // Nuevo campo para el idioma
}

interface TemplatesResponse {
    data: WhatsAppTemplate[];
    paging: {
        cursors: {
            before: string;
            after: string;
        };
    };
}

interface SendMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    phoneNumbers?: number[];
}

export const SendMessageModal = ({
    isOpen,
    onClose,
    selectedCount,
    phoneNumbers = []
}: SendMessageModalProps) => {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [templateParams, setTemplateParams] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        setError(null);
        try {
            const client = createRefreshTokenHttpClient("/chats");
            const response = await client.get<TemplatesResponse>("/templates");
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            setError("Error al cargar las plantillas");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSend = async () => {
        if (!phoneNumbers.length) {
            setError("No hay trabajadores seleccionados");
            return;
        }

        if (!selectedTemplate) {
            setError("Selecciona una plantilla");
            return;
        }

        // Obtener el idioma de la plantilla seleccionada
        const selectedTemplateObj = templates.find(t => t.name === selectedTemplate);
        if (!selectedTemplateObj) {
            setError("Plantilla no encontrada");
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const client = createRefreshTokenHttpClient("/chats");

            const request: SendTemplateRequest = {
                template: selectedTemplate,
                params: templateParams.filter(p => p.trim() !== ""),
                phoneNumbers,
                language: selectedTemplateObj.language  // Envía el idioma
            };

            await client.post("/send-bulk-template", request);

            // Limpiar estado y cerrar modal
            setSelectedTemplate(null);
            setTemplateParams([]);
            onClose();
        } catch (error) {
            console.error("Error al enviar mensajes:", error);
            setError("Error al enviar los mensajes");
        } finally {
            toast.success(`Plantilla enviada a ${selectedCount} trabajador(es)`);
            setIsSending(false);
        }
    };

    const handleTemplateChange = (value: string | null) => {
        setSelectedTemplate(value);
        setError(null);

        if (!value) {
            setTemplateParams([]);
            return;
        }

        const template = templates.find(t => t.name === value);
        if (template) {
            if (template.name === "candidato_seleccionado") {
                setTemplateParams(["", "", "", ""]); // Nombre, Día, Horario, Lugar
            } else {
                const bodyComponent = template.components.find(c => c.type === "BODY");
                const paramsCount = bodyComponent?.text?.match(/{{\d+}}/g)?.length || 0;
                setTemplateParams(Array(paramsCount).fill(""));
            }
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={`Enviar mensaje a ${selectedCount} trabajador(es)`}
            size="md"
            centered
            closeOnClickOutside={!isSending}
        >
            <LoadingOverlay visible={isSending} />

            <Stack>
                {error && (
                    <div style={{ color: "red", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                {/* Alerta especial para plantilla candidato_seleccionado */}
                {selectedTemplate === "candidato_seleccionado" && (
                    <div style={{
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ffeeba",
                        marginBottom: "15px"
                    }}>
                        <strong>AVISO:</strong> Esta plantilla iniciará el proceso de reclutamiento en los candidatos seleccionados.
                    </div>
                )}

                <Select
                    label="Plantilla de WhatsApp"
                    placeholder="Seleccionar plantilla"
                    data={templates.map(t => ({
                        value: t.name,
                        label: `${t.name} (${t.category}) [${t.language.toUpperCase()}]`
                    }))}
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    clearable
                    disabled={isLoadingTemplates || isSending}
                    style={{ width: '100%' }}
                    searchable
                />

                {selectedTemplate && (
                    <>
                        {templateParams.length > 0 && (
                            <Stack>
                                {selectedTemplate === "candidato_seleccionado" ? (
                                    <>
                                        <Textarea
                                            label="Nombre"
                                            value={templateParams[0]}
                                            onChange={(e) => {
                                                const newParams = [...templateParams];
                                                newParams[0] = e.currentTarget.value;
                                                setTemplateParams(newParams);
                                            }}
                                            autosize
                                            minRows={1}
                                            maxRows={3}
                                            disabled={isSending}
                                            required
                                        />
                                        <Textarea
                                            label="Día"
                                            value={templateParams[1]}
                                            onChange={(e) => {
                                                const newParams = [...templateParams];
                                                newParams[1] = e.currentTarget.value;
                                                setTemplateParams(newParams);
                                            }}
                                            autosize
                                            minRows={1}
                                            maxRows={3}
                                            disabled={isSending}
                                            required
                                        />
                                        <Textarea
                                            label="Horario"
                                            value={templateParams[2]}
                                            onChange={(e) => {
                                                const newParams = [...templateParams];
                                                newParams[2] = e.currentTarget.value;
                                                setTemplateParams(newParams);
                                            }}
                                            autosize
                                            minRows={1}
                                            maxRows={3}
                                            disabled={isSending}
                                            required
                                        />
                                        <Textarea
                                            label="Lugar"
                                            value={templateParams[3]}
                                            onChange={(e) => {
                                                const newParams = [...templateParams];
                                                newParams[3] = e.currentTarget.value;
                                                setTemplateParams(newParams);
                                            }}
                                            autosize
                                            minRows={1}
                                            maxRows={3}
                                            disabled={isSending}
                                            required
                                        />
                                    </>
                                ) : (
                                    templateParams.map((_, index) => (
                                        <Textarea
                                            key={index}
                                            label={`Parámetro ${index + 1}`}
                                            value={templateParams[index]}
                                            onChange={(e) => {
                                                const newParams = [...templateParams];
                                                newParams[index] = e.currentTarget.value;
                                                setTemplateParams(newParams);
                                            }}
                                            autosize
                                            minRows={1}
                                            maxRows={3}
                                            disabled={isSending}
                                        />
                                    ))
                                )}
                            </Stack>
                        )}
                        <Textarea
                            label="Vista previa de la plantilla"
                            value={getTemplatePreview(selectedTemplate)}
                            readOnly
                            autosize
                            minRows={3}
                            maxRows={5}
                        />
                    </>
                )}

                <Group justify="flex-end" gap="sm">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !selectedTemplate || phoneNumbers.length === 0}
                        color="blue"
                        loading={isSending}
                    >
                        Enviar plantilla
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );

    function getTemplatePreview(templateName: string): string {
        const template = templates.find(t => t.name === templateName);
        if (!template) return "";
    
        const header = template.components.find(c => c.type === "HEADER")?.text || "";
        const body = template.components.find(c => c.type === "BODY")?.text || "";
        const footer = template.components.find(c => c.type === "FOOTER")?.text || "";
    
        return `Idioma: ${template.language.toUpperCase()}\n\n${header}\n\n${body}\n\n${footer}`;
    }
};
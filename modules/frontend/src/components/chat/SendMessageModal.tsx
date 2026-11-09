import { Button, Group, LoadingOverlay, Modal, Select, Stack, Textarea } from "@mantine/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WhatsAppTemplateService } from "@/service/chat/WhatsAppTemplateService";
import { SendMessageModalProps, SendTemplateRequest, TemplateParam, WhatsAppTemplate } from "@/model/chats/Template";


/**
 * Modal para enviar mensajes de plantilla de WhatsApp
 */
export const SendMessageModal = ({
    isOpen,
    onClose,
    selectedCount,
    phoneNumber = 0
}: SendMessageModalProps) => {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [templateParams, setTemplateParams] = useState<TemplateParam[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar plantillas cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    /**
     * Carga las plantillas disponibles desde la API
     */
    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        setError(null);
        try {
            const templates = await WhatsAppTemplateService.fetchTemplates();
            setTemplates(templates);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            setError("Error al cargar las plantillas");
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    /**
     * Maneja el envío de la plantilla
     */
    const handleSend = async () => {
        if (!phoneNumber) {
            setError("No hay trabajadores seleccionados");
            return;
        }

        if (!selectedTemplate) {
            setError("Selecciona una plantilla");
            return;
        }

        // Verificar que todos los parámetros estén completos
        const emptyParams = templateParams.filter(param => !param.value.trim());
        if (emptyParams.length > 0) {
            setError(`Faltan parámetros obligatorios: ${emptyParams.map(p => p.name).join(', ')}`);
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
            // Preparamos la solicitud según el formato de la plantilla
            const request: SendTemplateRequest = {
                template: selectedTemplate,
                params: templateParams.map(p => p.value.trim()),
                phoneNumber,
                language: selectedTemplateObj.language,
                paramNames: undefined,
                paramTypes: undefined
            };

            // Si la plantilla usa formato NAMED, incluimos los nombres y tipos de los parámetros
            if (selectedTemplateObj.parameter_format === "NAMED") {
                request.paramNames = templateParams.map(p => p.name);
                request.paramTypes = templateParams.map(p => p.type || "text");
            }

            await WhatsAppTemplateService.sendTemplate(request);

            // Limpiar estado y cerrar modal
            setSelectedTemplate(null);
            setTemplateParams([]);
            onClose();
            toast.success(`Plantilla enviada a ${selectedCount} trabajador(es)`);
        } catch (error) {
            console.error("Error al enviar mensajes:", error);
            setError("Error al enviar los mensajes");
        } finally {
            setIsSending(false);
        }
    };

    /**
     * Maneja el cambio de plantilla seleccionada
     */
    const handleTemplateChange = (value: string | null) => {
        setSelectedTemplate(value);
        setError(null);

        if (!value) {
            setTemplateParams([]);
            return;
        }

        const template = templates.find(t => t.name === value);
        if (template) {
            const params = WhatsAppTemplateService.extractTemplateParams(template);
            setTemplateParams(params);
        }
    };

    /**
     * Actualiza el valor de un parámetro
     */
    const handleParamChange = (index: number, value: string) => {
        const newParams = [...templateParams];
        newParams[index] = { ...newParams[index], value };
        setTemplateParams(newParams);
    };

    /**
     * Obtiene la vista previa de la plantilla seleccionada
     */
    const getTemplatePreview = (): string => {
        if (!selectedTemplate) return "";
        
        const template = templates.find(t => t.name === selectedTemplate);
        if (!template) return "";
        
        return WhatsAppTemplateService.getTemplatePreview(template, templateParams);
    };

    return (
        <Modal
            opened={isOpen}
            onClose={onClose}
            title={`Plantilla de WhatsApp`}
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

                <Select
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
                                {templateParams.map((param, index) => (
                                    <Textarea
                                        key={index}
                                        label={param.name.charAt(0).toUpperCase() + param.name.slice(1)}
                                        placeholder={param.example ? `Ej: ${param.example}` : ''}
                                        value={param.value}
                                        onChange={(e) => handleParamChange(index, e.currentTarget.value)}
                                        autosize
                                        minRows={1}
                                        maxRows={3}
                                        disabled={isSending || param.isReadOnly}
                                        required
                                        error={!param.value.trim() ? "Este campo es obligatorio" : ""}
                                    />
                                ))}
                            </Stack>
                        )}
                        <Textarea
                            label="Vista previa de la plantilla"
                            value={getTemplatePreview()}
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
                        disabled={
                            isSending ||
                            !selectedTemplate ||
                            phoneNumber === 0 ||
                            templateParams.some(param => !param.value.trim())
                        }
                        color="blue"
                        loading={isSending}
                    >
                        Enviar plantilla
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
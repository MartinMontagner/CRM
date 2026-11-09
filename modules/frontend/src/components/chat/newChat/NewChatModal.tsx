// NewChatModal.tsx
import { WazendInstanceDTO } from "@/model/wazend/WazendInstanceDTO";
import { getAllWazendInstances, sendWazendMessage } from "@/service/chat/WazendService";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageSquare, SendHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { z } from "zod";
import { FormField } from "./FormField";
import { ModalButton } from "./ModalButton";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewChatData) => void;
}

export interface NewChatData {
  phoneNumber: string;
  message: string;
  instanceId?: number; // Nueva propiedad para la instancia seleccionada
}

// Updated schema to work with international phone format
const chatSchema = z.object({
  phoneNumber: z
    .string()
    .min(5, "El número debe tener al menos 5 dígitos")
    .max(40, "El número no debe exceder 40 dígitos")
    // Modified regex to allow for "+" at beginning for international format
    .regex(/^\+?\d+$/, "Formato de número inválido"),
  message: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(500, "El mensaje es demasiado largo"),
  instanceId: z
    .number({ required_error: "Debe seleccionar una instancia" })
    .optional()
    .refine(val => val !== undefined, {
      message: "Debe seleccionar una instancia"
    })
});

const NewChatModal = ({ isOpen, onClose, onSubmit }: NewChatModalProps) => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | undefined>(undefined);
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    message?: string;
    instanceId?: string;
  }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<WazendInstanceDTO[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);

  // Cargar instancias de Wazend cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadWazendInstances();
    }
  }, [isOpen]);

  const loadWazendInstances = async () => {
    try {
      setInstancesLoading(true);
      const instancesData = await getAllWazendInstances();
      setInstances(instancesData);

      // Si hay una sola instancia, seleccionarla por defecto
      if (instancesData.length === 1) {
        setSelectedInstanceId(instancesData[0].id);
      }
    } catch (error) {
      console.error("Error al cargar instancias de Wazend:", error);
    } finally {
      setInstancesLoading(false);
    }
  };

  // Validate form whenever inputs change
  useEffect(() => {
    const result = chatSchema.safeParse({
      phoneNumber: phone,
      message,
      instanceId: selectedInstanceId
    });

    if (!result.success) {
      const fieldErrors: {
        phoneNumber?: string;
        message?: string;
        instanceId?: string;
      } = {};

      result.error.errors.forEach((err) => {
        if (err.path[0] === "phoneNumber")
          fieldErrors.phoneNumber = err.message;
        if (err.path[0] === "message")
          fieldErrors.message = err.message;
        if (err.path[0] === "instanceId")
          fieldErrors.instanceId = err.message;
      });

      setErrors(fieldErrors);
      setIsFormValid(false);
    } else {
      setErrors({});
      setIsFormValid(true);
    }
  }, [phone, message, selectedInstanceId]);

  const validateField = (
    field: "phoneNumber" | "message" | "instanceId",
    value: string | number | undefined
  ) => {
    try {
      if (field === "phoneNumber") {
        const phoneSchema = chatSchema.shape.phoneNumber;
        phoneSchema.parse(value);
        setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
      } else if (field === "message") {
        const messageSchema = chatSchema.shape.message;
        messageSchema.parse(value);
        setErrors((prev) => ({ ...prev, message: undefined }));
      } else if (field === "instanceId") {
        const instanceSchema = chatSchema.shape.instanceId;
        instanceSchema.parse(value);
        setErrors((prev) => ({ ...prev, instanceId: undefined }));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message;
        setErrors((prev) => ({ ...prev, [field]: message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submission
    const result = chatSchema.safeParse({
      phoneNumber: phone,
      message,
      instanceId: selectedInstanceId
    });

    if (!result.success) {
      const fieldErrors: {
        phoneNumber?: string;
        message?: string;
        instanceId?: string;
      } = {};

      result.error.errors.forEach((err) => {
        if (err.path[0] === "phoneNumber")
          fieldErrors.phoneNumber = err.message;
        if (err.path[0] === "message")
          fieldErrors.message = err.message;
        if (err.path[0] === "instanceId")
          fieldErrors.instanceId = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    if (!selectedInstanceId) {
      setErrors((prev) => ({
        ...prev,
        instanceId: "Debe seleccionar una instancia de Wazend"
      }));
      return;
    }

    try {
      setLoading(true);

      // Enviar mensaje a través de la instancia seleccionada de Wazend
      await sendWazendMessage(
        {
          phoneNumber: phone,
          content: message,
          messageType: "TEXT",
          sender: "USER"
        },
        selectedInstanceId,
        false
      );

      // Llamar al callback con los datos
      onSubmit({
        phoneNumber: phone,
        message,
        instanceId: selectedInstanceId
      });

      // Limpiar formulario
      setPhone("");
      setMessage("");
      setSelectedInstanceId(undefined);
      setErrors({});

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      // Mostrar error genérico
      alert("Error al enviar mensaje. Por favor intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold">Nuevo Chat</h2>
              </div>
              <ModalButton onClick={onClose} variant="icon" aria-label="Cerrar">
                <X size={20} />
              </ModalButton>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Selector de Instancia Wazend */}
              <div className="mb-4">
                <label htmlFor="wazendInstance" className="block text-sm font-medium mb-2">
                  Instancia de Wazend
                </label>
                {instancesLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-gray-500">Cargando instancias...</span>
                  </div>
                ) : instances.length === 0 ? (
                  <div className="text-red-500 font-bold text-sm py-2">
                    No hay instancias disponibles. Contacte al administrador.
                  </div>
                ) : (
                  <select
                    id="wazendInstance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedInstanceId || ""}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      setSelectedInstanceId(value);
                      validateField("instanceId", value);
                    }}
                  >
                    <option value="">Seleccione una instancia</option>
                    {instances.map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.name}
                      </option>
                    ))}
                  </select>
                )}
                {errors.instanceId && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {errors.instanceId}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Número de teléfono
                </label>
                <PhoneInput
                  defaultCountry="es"
                  value={phone}
                  onChange={(newPhone: string) => {
                    setPhone(newPhone);
                    validateField("phoneNumber", newPhone);
                  }}
                  inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 font-bold text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <FormField
                id="message"
                label="Mensaje inicial"
                as="textarea"
                value={message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setMessage(newValue);
                  validateField("message", newValue);
                }}
                placeholder="Escribe un mensaje inicial..."
                className="min-h-[100px]"
                required
              />
              {errors.message && (
                <p className="text-red-500 font-bold text-xs mt-1 mb-4">
                  {errors.message}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <ModalButton
                  type="button"
                  onClick={onClose}
                  variant="secondary"
                >
                  Cancelar
                </ModalButton>
                <ModalButton
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <SendHorizontal size={16} />
                      <span>Enviar</span>
                    </>
                  )}
                </ModalButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
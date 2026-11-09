import { CustomTag } from "@/model/chats/Contact";
import { addcustomTagToConversation, getAvailableCustomTags, removeCustomTagToConversation } from "@/service/chat/CustomTagService";
import { getTextColor } from "@/utils/getTextColor";
import { useEffect, useState } from "react";

interface ContactLabelsProps {
  conversationId: number;
  selectedLabels: CustomTag[];
  updateLabels: (labels: CustomTag[]) => void;
}

const ContactLabels: React.FC<ContactLabelsProps> = ({
  conversationId,
  selectedLabels,
  updateLabels
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [labelOptions, setLabelOptions] = useState<CustomTag[]>([]);

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        const availableTags = await getAvailableCustomTags(conversationId);
        setLabelOptions(availableTags);
        console.log("Etiquetas personalizadas disponibles:", availableTags);
        
      } catch (error) {
        console.error("Error al obtener etiquetas personalizadas:", error);
      }
    };
    fetchCustomTags();
  }, [conversationId]);

  // Handle adding a new label
  const addLabel = (label: CustomTag) => {
    // Verificar si ya está seleccionada comparando por ID
    const isAlreadySelected = selectedLabels.some(selected => selected.id === label.id);
    
    if (!isAlreadySelected) {
      const newLabels = [...selectedLabels, label];
      updateLabels(newLabels);
      setShowDropdown(false);
    }
    
    try {
      addcustomTagToConversation(conversationId, label);
    } catch (error) {
      console.error("Error al agregar etiqueta a la conversación:", error);
      throw new Error("Error adding label to conversation: " + error);
    }
  };

  // Handle removing a label
  const removeLabel = async (label: CustomTag) => {
    // Filtrar comparando por ID
    const newLabels = selectedLabels.filter(l => l.id !== label.id);
    updateLabels(newLabels);
    await removeCustomTagToConversation(conversationId, label);
  };

  // Get available options (that aren't already selected) - comparando por ID
  const availableOptions = labelOptions.filter(
    option => !selectedLabels.some(selected => selected.id === option.id)
  );

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">Etiquetas:</p>

      <div className="flex flex-wrap gap-1 mb-2">
        {selectedLabels.map((label) => (
          <div
            key={label.id}
            className="flex items-center px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: label.color || '#e0e0e0', color: getTextColor(label.dark || false) }}
          >
            {label.name}
            <button
              onClick={() => removeLabel(label)}
              className="ml-1 text-opacity-70 hover:text-opacity-100 flex-shrink-0"
              aria-label={`Eliminar etiqueta ${label.name}`}
            >
              ×
            </button>
          </div>
        ))}

        <div className="relative inline-block">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-2 py-0.5 border border-gray-300 rounded-full text-xs bg-white hover:bg-gray-50"
          >
            Añadir
          </button>

          {showDropdown && availableOptions.length > 0 && (
            <div className="absolute top-0 left-0 transform -translate-y-full mt-1 w-40 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-32 overflow-y-auto">
              {availableOptions.map(option => (
                <button
                  key={option.id}
                  className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 truncate"
                  onClick={() => addLabel(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactLabels;
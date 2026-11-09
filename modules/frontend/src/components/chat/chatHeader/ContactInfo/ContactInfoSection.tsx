import { useState } from "react";
import { ContactInfo, CustomTag } from "@/model/chats/Contact";
import { updateContact } from "@/service/wordpress/MemberService";
// import { MdModeEditOutline, MdSave } from "react-icons/md";
import ContactLabels from "./ContactLabels";
import ContactEditableFields from "./ContactEditableFields";

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo | null>>;
  isLoadingContact: boolean;
  contactError: string | null;
  loadContactInfo: () => void;
  isMobileView: boolean;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  contactInfo,
  setContactInfo,
  isLoadingContact,
  contactError,
  loadContactInfo,
  isMobileView
}) => {
  // const [isEditableMode, setEditableMode] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<CustomTag[]>(contactInfo?.customTags || []);

  // Actualizar etiquetas en el objeto de contacto cuando cambien
  const updateLabels = (newLabels: CustomTag[]) => {
    setSelectedLabels(newLabels);
    if (contactInfo) {
      setContactInfo({
        ...contactInfo,
        customTags: newLabels
      });
    }
  };

  // Guardar cambios
  const saveChanges = async () => {
    if (contactInfo) {
      try {
        await updateContact(contactInfo.conversationId, contactInfo);
        loadContactInfo(); // Recargar la información actualizada
      } catch (error) {
        console.error("Error al guardar cambios:", error);
      }
    }
  };

  return (
    <div className={`bg-white p-2 border border-gray-300 rounded-xl ${isMobileView ? 'h-auto' : 'h-full'} relative`}>
      <div className="mb-1">
        <div className="flex justify-center">
          {/* <div className="flex justify-center items-center">
            <button
              onClick={() => setEditableMode(prevMode => !prevMode)}
              disabled={isLoadingContact}
            >
              <MdModeEditOutline />
            </button>
          </div> */}
          <div className="flex justify-center items-center gap-1">
            <label className="block text-sm font-bold text-gray-700">
              DATOS PERSONALES
            </label>
            <button
              onClick={loadContactInfo}
              disabled={isLoadingContact}
              className="inline-flex items-center px-1 py-1 text-xs font-medium rounded-full text-tertiary-700 bg-tertiary-100 hover:bg-tertiary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary-500 disabled:opacity-50"
              title="Actualizar información de contacto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isLoadingContact ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {/* <div className="flex justify-center items-center">
            <button
              onClick={saveChanges}
              disabled={isLoadingContact}
            >
              <MdSave />
            </button>
          </div> */}
        </div>
      </div>

      {isLoadingContact ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <svg className="animate-spin h-6 w-6 text-tertiary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : contactError ? (
        <div className="p-2 bg-red-50 text-red-700 rounded-md text-xs">
          {contactError}
        </div>
      ) : (
        <div className="space-y-2 max-w-full flex flex-col h-full">
          <ContactEditableFields
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
          // isEditableMode={isEditableMode}
          />

          <ContactLabels
            conversationId={contactInfo?.conversationId}
            selectedLabels={selectedLabels}
            updateLabels={updateLabels}
          />

          <div className="flex flex-col flex-grow md:h-1/3 p-3">
            <p className="text-xs font-medium text-gray-500">Notas</p>
            <div className="flex-grow md:h-1/3">
              <textarea
                className="w-full md:h-2/3 p-2 border rounded-md bg-gray-50 text-xs resize-none"
                placeholder="Añadir notas..."
                onChange={(e) => setContactInfo({ ...contactInfo, note: e.target.value })}
                value={contactInfo?.note || ''}
              ></textarea>
              <div className="flex justify-end pb-1">
                <button
                  onClick={saveChanges}
                  disabled={isLoadingContact}
                  className="px-3 py-1 text-xs font-normal text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Guardar notas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInfoSection;
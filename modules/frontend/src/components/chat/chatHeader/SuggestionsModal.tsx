import { AssistantDTO } from "@/model/chats/Chat";
import { useState, useEffect } from "react";
import { ContactInfo } from "@/model/chats/Contact";
import { getContact } from "@/service/wordpress/MemberService";

// Componentes modularizados
import ContactInfoSection from "./ContactInfo/ContactInfoSection";
import MemberSearchSection from "./MemberAssociation/MemberSearchSection";
import StudentProfileSection from "./StudentProfile/StudentProfileSection";
import AIAnalysisSection from "./Analysis/AIAnalysisSection";
import SuggestionSection from "./Suggestions/SuggestionSection";
import FeedbackModal from "./Feedback/FeedbackModal";

interface SuggestionsModalProps {
  conversationId: number;
  isOpen: boolean;
  onClose: () => void;
  onSendSuggestion: (text: string) => void;
  phoneNumber: string;
  analisis?: string;
  assistantOptions?: AssistantDTO[];
  initialEditableText?: string;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({
  conversationId,
  isOpen,
  onClose,
  onSendSuggestion,
  phoneNumber,
  analisis,
  assistantOptions = [],
  initialEditableText = "",
}) => {
  // Estado para la detección de dispositivo móvil
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  // Estado para la información de contacto
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Estado para el modal de feedback
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackAssistant, setFeedbackAssistant] = useState<string>('');

  // Estado para la sección de análisis
  const [analysisText, setAnalysisText] = useState<string>('');

  // Estado para la sección de edición
  const [editableText, setEditableText] = useState<string>('');

  // Detector de vista móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Función para cargar la información de contacto
  const loadContactInfo = async () => {
    if (!phoneNumber) {
      setContactError('Número de teléfono no proporcionado');
      return;
    }

    setIsLoadingContact(true);
    setContactError(null);

    try {
      const data = await getContact(phoneNumber, conversationId);
      const interestTag = formatInterestTag(data.interestTag!) || null;
      setContactInfo({
        ...data,
        labels: interestTag ? [interestTag] : [],
      });
    } catch (err) {
      console.error('Error al obtener información de contacto:', err);

      // Proporcionar un objeto de contacto vacío en caso de error
      setContactInfo({
        conversationId: 0,
        email: "",
        firstName: "",
        lastName: "",
        telefono: phoneNumber || "",
        status: null,
        productName: null,
        addressCountry: "",
        interestTag: null,
        labels: [],
        subscription: null,
        activeTxnCount: null,
        expiredTxnCount: null,
        latestTxnDate: null,
        lastLoginDate: null,
        refacturacion: null,
        registered: null,
        note: null,
        customTags: null
      });
    } finally {
      setIsLoadingContact(false);
    }
  };

  const formatInterestTag = (tag: string): string | null => {
    const mapping: Record<string, string> = {
      'COMPROMISO': 'Compromiso de Pago',
      'INTERESADO': 'Interesado',
      'NO_INTERESADO': 'No Interesado',
      'PRIMERA_REGESTION': 'Primera Regestión',
      'SEGUNDA_REGESTION': 'Segunda Regestión',
    }

    return mapping[tag] || null;
  };

  // Cargar información cuando se abre el modal
  useEffect(() => {
    if (isOpen && phoneNumber) {
      loadContactInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phoneNumber]);

  // Actualizar estados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setAnalysisText(analisis || '');
      setEditableText(initialEditableText || '');
    }
  }, [isOpen, analisis, initialEditableText]);

  // Gestión del texto editable
  const updateEditableText = (newText: string) => {
    setEditableText(newText);
  };

  // Abrir modal de feedback
  const openFeedbackModal = (assistantType: string = '') => {
    setFeedbackAssistant(assistantType);
    setIsFeedbackModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-4 w-[90vw] md:w-[80vw] h-[85vh] md:h-[95vh] overflow-hidden flex flex-col">
        {/* Header con botón de cierre */}
        <div className="flex justify-end items-center mb-1">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenedor principal que se adapta a móvil/desktop */}
        <div className={`flex ${isMobileView ? 'flex-col' : 'flex-row'} flex-grow h-full overflow-y-auto`}>
          {/* Primera columna - Información de contacto y perfil */}
          <div className={`${isMobileView ? 'w-full mb-3' : 'w-2/5 pr-2'} flex flex-col ${isMobileView ? 'h-auto' : 'h-full'}`}>
            {
              contactInfo?.email !== null && !isLoadingContact ? (
                <h3 className="text-base font-bold mb-2 text-center">INFORMACIÓN BÁSICA</h3>
              ) : (
                <h3 className="text-base font-bold mb-2 text-center">NO EXISTE MIEMBRO ASOCIADO</h3>
              )
            }

            {/* Contenedor principal con altura y distribución fijas */}
            <div className="flex flex-col h-full gap-3 overflow-y-auto">
              {/* Sección de datos personales */}
              <div className={`flex flex-col w-full ${isMobileView ? 'h-auto' : 'flex-grow'}`}>
                {contactInfo?.email !== null && !isLoadingContact ? (
                  <ContactInfoSection
                    contactInfo={contactInfo!}
                    setContactInfo={setContactInfo}
                    isLoadingContact={isLoadingContact}
                    contactError={contactError}
                    loadContactInfo={loadContactInfo}
                    isMobileView={isMobileView}
                  />
                ) : (
                  <MemberSearchSection
                    isLoadingContact={isLoadingContact}
                    setContactInfo={setContactInfo}
                    contactInfo={contactInfo!}
                    phoneNumber={phoneNumber}
                    conversationId={contactInfo?.conversationId || 0}
                    loadContactInfo={loadContactInfo}
                    isMobileView={isMobileView}
                  />
                )}
              </div>

              {/* Sección de Perfil de alumno */}
              {
                contactInfo?.email !== null && !isLoadingContact && (
                  <StudentProfileSection
                    contactInfo={contactInfo!}
                    isLoadingContact={isLoadingContact}
                    contactError={contactError}
                    loadContactInfo={loadContactInfo}
                    isMobileView={isMobileView}
                  />
                )
              }
            </div>
          </div>

          {/* Segunda columna - Análisis y Sugerencias */}
          <div className="w-full flex flex-col space-y-3">
            {/* Sección de análisis */}
            <AIAnalysisSection
              analysisText={analysisText}
              setAnalysisText={setAnalysisText}
              phoneNumber={phoneNumber}
              isMobileView={isMobileView}
            />

            {/* Sección de sugerencias */}
            <h3 className="text-base font-bold mb-2 text-start ml-3">SUGERENCIAS DE LA IA</h3>
            <SuggestionSection
              phoneNumber={phoneNumber}
              editableText={editableText}
              updateEditableText={updateEditableText}
              assistantOptions={assistantOptions.filter(
                option => option.value !== 'hablacomo' && option.value !== 'analisis'
              )}
              onSendSuggestion={onSendSuggestion}
              onOpenFeedbackModal={openFeedbackModal}
              onClose={onClose}
              isMobileView={isMobileView}
            />
          </div>
        </div>
      </div>

      {/* Modal de Feedback */}
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          assistantOptions={assistantOptions}
          initialAssistant={feedbackAssistant}
          phoneNumber={phoneNumber}
          editableText={editableText}
        />
      )}
    </div>
  );
};

export default SuggestionsModal;
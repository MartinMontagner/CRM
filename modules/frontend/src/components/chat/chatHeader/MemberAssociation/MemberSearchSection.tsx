import { useState, useEffect } from "react";
import { associateMemberToConversation } from "@/service/chat/ChatService";
import { getFilteredMemberSubscriptions } from "@/service/wordpress/MemberService";
import { MemberSubscriptionViewDTO } from "@/model/member/Member";
import MemberSearchForm from "./MemberSearchForm";
import MemberSearchResults from "./MemberSearchResults";
import { ContactInfo, CustomTag } from "@/model/chats/Contact";
import ContactLabels from "../ContactInfo/ContactLabels";

interface MemberSearchSectionProps {
  isLoadingContact: boolean;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo | null>>;
  contactInfo: ContactInfo;
  phoneNumber: string;
  conversationId: number;
  loadContactInfo: () => void;
  isMobileView: boolean;
}

const MemberSearchSection: React.FC<MemberSearchSectionProps> = ({
  isLoadingContact,
  setContactInfo,
  contactInfo,
  loadContactInfo,
  conversationId,
  isMobileView
}) => {
  // Estados para el formulario de búsqueda
  const [searchField, setSearchField] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  // Estados para los resultados de búsqueda y el miembro seleccionado
  const [members, setMembers] = useState<MemberSubscriptionViewDTO[]>([]);
  const [member, setMember] = useState<MemberSubscriptionViewDTO | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Estados para custom tags - inicializar como array vacío
  const [selectedLabels, setSelectedLabels] = useState<CustomTag[]>([]);

  // Sincronizar selectedLabels cuando contactInfo cambie
  useEffect(() => {
    if (contactInfo?.customTags) {
      setSelectedLabels(contactInfo.customTags);
    }
  }, [contactInfo]);

  // Función para manejar la búsqueda de miembros
  const handleSearchMember = async (): Promise<void> => {
    if (!searchField || !searchValue.trim()) return;

    setIsSearching(true);
    setIsLoadingMembers(true);

    try {
      const results = await getFilteredMemberSubscriptions(
        [
          {
            field: searchField,
            value: searchValue,
            operator: "contains",
          },
        ],
        0,
      );
      setHasSearched(true);
      setMembers(results.content);
      setIsLoadingMembers(false);
      setIsSearching(false);
    } catch (error) {
      console.error("Error al buscar miembros:", error);
      setIsLoadingMembers(false);
      setIsSearching(false);
    }
  };

  // Función para asociar el miembro seleccionado
  const handleAssignMember = async (): Promise<void> => {
    if (!member) return;

    try {
      await associateMemberToConversation(conversationId, member.id);

      // Limpiar el formulario después de asociar
      setSearchField("");
      setSearchValue("");
      setMembers([]);
      setMember(null);

      // Recargar la información de contacto
      loadContactInfo();
    } catch (error) {
      console.error("Error al asociar miembro:", error);
    }
  };

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

  return (
    <div className={`bg-white p-2 border border-gray-300 rounded-xl ${isMobileView ? 'h-auto' : 'h-full'} relative`}>
      <div className="h-[100%]">
        <div className="mb-3 mt-2 h-[100%]">
          <p className="text-sm font-medium mb-2 text-center">Asociar un miembro</p>

          <MemberSearchForm
            searchField={searchField}
            setSearchField={setSearchField}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            isLoadingMembers={isLoadingMembers}
            handleSearchMember={handleSearchMember}
          />
          { contactInfo && contactInfo && (
          <div className="mt-4 mb-4 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 shadow-sm text-sm text-gray-700 flex items-center justify-between">
            <span className="font-medium text-gray-600">Teléfono:</span>
            <span className="ml-2 text-gray-800">{contactInfo.telefono}</span>
          </div>
          )}

          {/* Renderizar solo cuando contactInfo esté disponible y no esté cargando */}
          {contactInfo && !isLoadingContact && (
            <ContactLabels
              conversationId={contactInfo.conversationId}
              selectedLabels={selectedLabels}
              updateLabels={updateLabels}
            />
          )}

          {/* Mostrar loading state para las etiquetas */}
          {isLoadingContact && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              Cargando etiquetas...
            </div>
          )}

          {/* Mostrar resultados de búsqueda si existen */}
          {members.length > 0 && (
            <MemberSearchResults
              members={members}
              member={member}
              setMember={setMember}
              handleAssignMember={handleAssignMember}
            />
          )}

          {isSearching && (
            <p className="text-xs text-gray-500 mt-2">Buscando miembros...</p>
          )}

          {!isSearching && hasSearched && members.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">No se encontraron miembros.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberSearchSection;
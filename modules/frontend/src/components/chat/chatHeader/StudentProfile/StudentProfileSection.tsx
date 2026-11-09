import { ContactInfo } from "@/model/chats/Contact";
import getCountryCode from "@/utils/getCountryCode";

interface StudentProfileSectionProps {
  contactInfo: ContactInfo;
  isLoadingContact: boolean;
  contactError: string | null;
  loadContactInfo: () => void;
  isMobileView: boolean;
}

const StudentProfileSection: React.FC<StudentProfileSectionProps> = ({
  contactInfo,
  isLoadingContact,
  contactError,
  loadContactInfo,
  isMobileView
}) => {
  return (
    <div className={`flex flex-col w-full ${isMobileView ? 'h-auto' : 'h-auto'}`}>
      <div className={`bg-white p-2 border border-gray-300 rounded-xl ${isMobileView ? 'h-auto' : 'h-full'} overflow-y-auto relative`}>
        <div className="flex justify-center items-center mb-1">
          <div className="flex justify-center items-center gap-1">
            <label className="block text-sm font-bold text-gray-700">
              PERFIL DE ALUMNO
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
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Suscripción</p>
                <p className="text-xs text-gray-900">
                  {contactInfo?.productName || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Txn Activa</p>
                <p className="text-xs text-gray-900">
                  {contactInfo?.activeTxnCount || 'No disponible'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Refacturación</p>
                <p className="text-xs text-gray-900">
                  {contactInfo?.refacturacion || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Txn Pasadas</p>
                <p className="text-xs text-gray-900">
                  {contactInfo?.expiredTxnCount || 0}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Último acceso</p>
                <p className="text-xs text-gray-900">
                  {contactInfo?.lastLoginDate || 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">País</p>
                <p className="text-xs text-gray-900">
                  {getCountryCode(contactInfo?.addressCountry) || 'No disponible'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Fecha de registro</p>
              <p className="text-xs text-gray-900">
                {contactInfo?.registered || 'No disponible'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileSection;
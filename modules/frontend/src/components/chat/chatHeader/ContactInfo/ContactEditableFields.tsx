import { ContactInfo } from "@/model/chats/Contact";

interface ContactEditableFieldsProps {
  contactInfo: ContactInfo;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo | null>>;
  // isEditableMode: boolean;
}

const ContactEditableFields: React.FC<ContactEditableFieldsProps> = ({
  contactInfo,
  // setContactInfo,
  // isEditableMode
}) => {
  // Función para actualizar un campo específico
  // const updateField = (field: keyof ContactInfo, value: string) => {
  //   if (contactInfo) {
  //     setContactInfo({
  //       ...contactInfo,
  //       [field]: value
  //     });
  //   }
  // };

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500">Nombre</p>
          {/* {isEditableMode ? (
            <input
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
              value={contactInfo?.firstName || ''}
              onChange={(e) => updateField('firstName', e.target.value)}
            />
          ) : ( */}
            <p className="text-xs text-gray-900">
              {contactInfo?.firstName || 'No disponible'}
            </p>
          {/* )} */}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Apellido</p>
          {/* {isEditableMode ? (
            <input
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
              value={contactInfo?.lastName || ''}
              onChange={(e) => updateField('lastName', e.target.value)}
            />
          ) : ( */}
            <p className="text-xs text-gray-900">
              {contactInfo?.lastName || 'No disponible'}
            </p>
          {/* )} */}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500">Email</p>
        {/* {isEditableMode ? (
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
            value={contactInfo?.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
          />
        ) : ( */}
          <p className="text-xs text-gray-900">
            {contactInfo?.email || 'No disponible'}
          </p>
        {/* )} */}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500">Teléfono</p>
          {/* {isEditableMode ? (
            <input
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
              value={contactInfo?.telefono || ''}
              onChange={(e) => updateField('telefono', e.target.value)}
            />
          ) : ( */}
            <p className="text-xs text-gray-900">
              {contactInfo?.telefono || 'No disponible'}
            </p>
          {/* )} */}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">País</p>
          {/* {isEditableMode ? (
            <input
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded"
              value={contactInfo?.addressCountry || ''}
              onChange={(e) => updateField('addressCountry', e.target.value)}
            />
          ) : ( */}
            <p className="text-xs text-gray-900">
              {contactInfo?.addressCountry || 'No disponible'}
            </p>
          {/* )} */}
        </div>
      </div>
    </>
  );
};

export default ContactEditableFields;
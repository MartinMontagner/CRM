import { IoMdSend } from "react-icons/io";
import { ImCross } from "react-icons/im";

export const DisabledChatInput = () => {
  return (
    <div className="bg-grey-100 px-4 py-2 rounded-b-2xl">
      <div className="w-full flex">
        {/* Mensaje informativo cuando la instancia fue eliminada */}
        <div className="flex-1 text-sm text-grey-500 bg-grey-200 rounded-lg py-3 px-4 flex items-center">
          <ImCross className="text-red-500 mr-3" />
          <span className="select-none text-grey-500/65">
            {
              "Chat no disponible. La instancia de Wazend ha sido eliminada y ya no es posible enviar mensajes."
            }
          </span>
        </div>

        {/* Botón deshabilitado para mantener consistencia visual */}
        <button
          type="button"
          className="ml-2 p-2 rounded-lg opacity-30 cursor-not-allowed"
          disabled={true}
          title="Chat deshabilitado"
        >
          <IoMdSend className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

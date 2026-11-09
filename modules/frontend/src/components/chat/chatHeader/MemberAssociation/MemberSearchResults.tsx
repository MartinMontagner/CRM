import { MemberSubscriptionViewDTO } from "@/model/member/Member";

interface MemberSearchResultsProps {
  members: MemberSubscriptionViewDTO[];
  member: MemberSubscriptionViewDTO | null;
  setMember: (member: MemberSubscriptionViewDTO) => void;
  handleAssignMember: () => Promise<void>;
}

const MemberSearchResults: React.FC<MemberSearchResultsProps> = ({
  members,
  member,
  setMember,
  handleAssignMember
}) => {
  // Función para mostrar el nombre completo
  const getMemberFullName = (memberData: MemberSubscriptionViewDTO): string => {
    return `${memberData.firstName} ${memberData.lastName} (${memberData.email})`;
  };

  return (
    <div className="mt-3 h-[75%]">
      <div className="flex flex-col gap-2 sm:h-[100%] items-center">
        {/* Tabla scrolleable */}
        <div className="border border-gray-300 rounded-md overflow-hidden sm:max-full-64 max-w-full">
          <div className="sm:max-h-72 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miembros
                  </th>
                  <th scope="col" className="w-12 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-gray-50 cursor-pointer ${!!member && member.id === m.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setMember(m)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {getMemberFullName(m)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs">
                      <input
                        type="radio"
                        name="memberSelection"
                        checked={!!member && member.id === m.id}
                        onChange={() => setMember(m)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mensaje cuando no hay miembros */}
        {members.length === 0 && (
          <div className="text-center py-3 text-gray-500 text-xs">
            No hay miembros disponibles
          </div>
        )}

        {/* Botón de asociar */}
        <div>
          <button
            onClick={handleAssignMember}
            disabled={!member}
            className={`rounded-md text-xs h-9 px-3 transition-colors ${member
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            Asociar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberSearchResults;
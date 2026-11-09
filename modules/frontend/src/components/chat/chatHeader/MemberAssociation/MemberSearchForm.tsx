interface MemberSearchFormProps {
  searchField: string;
  setSearchField: (field: string) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  isLoadingMembers: boolean;
  handleSearchMember: () => Promise<void>;
}

const MemberSearchForm: React.FC<MemberSearchFormProps> = ({
  searchField,
  setSearchField,
  searchValue,
  setSearchValue,
  isLoadingMembers,
  handleSearchMember
}) => {
  return (
    <div className="text-xs flex flex-col gap-2">
      <div className="text-xs flex gap-2">
        <select
          name="searchField"
          value={searchField}
          id="searchField"
          onChange={(e) => setSearchField(e.target.value)}
          className="border border-gray-300 rounded-md h-9 px-2 w-28"
        >
          <option value="" disabled>Buscar por...</option>
          <option value="email">Email</option>
          <option value="firstName">Nombre</option>
          <option value="lastName">Apellido</option>
        </select>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={!searchField}
          className="border border-gray-300 rounded-md h-9 px-2 flex-1 w-11"
          placeholder="Buscar miembro..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSearchMember}
          className="bg-white border border-gray-300 rounded-md h-9 px-3 hover:bg-gray-50"
          disabled={isLoadingMembers || !searchField || !searchValue.trim()}
        >
          {isLoadingMembers ? "Buscando..." : "Buscar"}
        </button>
      </div>
    </div>
  );
};

export default MemberSearchForm;
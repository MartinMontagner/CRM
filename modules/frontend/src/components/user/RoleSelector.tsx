import { roleLabels, UserRole } from "@/types/Roles";

export  const RoleSelector = ({
    userId,
    className = "",
    selectedRoles,
    processingUsers,
    handleRoleChange,
  }: {
    userId: number;
    className?: string;
    selectedRoles: Record<number, UserRole | undefined>;
    setSelectedRoles: React.Dispatch<React.SetStateAction<Record<number, UserRole | undefined>>>;
    processingUsers: Record<number, boolean>;
    handleRoleChange: (userId: number, role: UserRole) => void;
  }) => (
    <div className={`relative ${className}`}>
      <select
        value={selectedRoles[userId] || ""}
        onChange={(e) => handleRoleChange(userId, e.target.value as UserRole)}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
        disabled={processingUsers[userId]}
      >
        <option value="" disabled>
          Seleccionar rol
        </option>
        <optgroup label="Administración">
          {/*<option value={UserRole.SUPER_ADMIN}>
            {roleLabels[UserRole.SUPER_ADMIN]}
          </option>*/}
          <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
        </optgroup>
        {/*<optgroup label="Marketing">
          <option value={UserRole.RESP_MARKETING}>
            {roleLabels[UserRole.RESP_MARKETING]}
          </option>
          <option value={UserRole.MARKETING}>
            {roleLabels[UserRole.MARKETING]}
          </option>
        </optgroup>
        <optgroup label="Atención al Alumno">
          <option value={UserRole.RESP_ATT_ALUMNO}>
            {roleLabels[UserRole.RESP_ATT_ALUMNO]}
          </option>
          <option value={UserRole.ATT_ALUMNO}>
            {roleLabels[UserRole.ATT_ALUMNO]}
          </option>
        </optgroup>*/}
        <optgroup label="Coach">
          <option value={UserRole.COACH_HEBREO}>
            {roleLabels[UserRole.COACH_HEBREO]}
          </option>
          <option value={UserRole.COACH_MENTORIA}>
            {roleLabels[UserRole.COACH_MENTORIA]}
          </option>
        </optgroup>
        <optgroup label="Ventas">
          <option value={UserRole.VENTAS}>
            {roleLabels[UserRole.VENTAS]}
          </option>
        </optgroup>
        <optgroup label="Usuario General">
          <option value={UserRole.USER}>
            {roleLabels[UserRole.USER]}
          </option>
        </optgroup>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

    </div>
  );
import { SquarePen, UserCog } from "lucide-react";

interface PageHeaderProps {
  handlePageTypeChange: (type: "pending" | "edit") => void;
  showPageType: "pending" | "edit";
  hasAcces?: boolean; // por defecto true, si no se pasa como prop
}
export const PageHeader = ({
  handlePageTypeChange,
  showPageType,
  hasAcces = false, // por defecto true, si no se pasa como prop
}: PageHeaderProps) => {

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Registros</h1>
        <p className="text-gray-500 mt-1">
          Administra solicitudes de acceso y asigna roles a nuevos usuarios
        </p>
      </div>
      {/**
       * boton para seleccionar si editar o agregar un nuevo usuario
       */}
      {hasAcces && (
        <div
          className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition duration-200"
          onClick={() =>
            handlePageTypeChange(
              showPageType === "pending" ? "edit" : "pending"
            )
          }
        >
          {showPageType === "pending" ? <SquarePen /> : <UserCog />}
        </div>
      )}
    </div>
  );
};
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoPermissionView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-amber-100 p-4 mb-6">
        <Shield className="h-12 w-12 text-amber-600" />
      </div>

      <h1 className="text-2xl font-bold mb-3 text-gray-800">
        Acceso restringido
      </h1>

      <p className="text-gray-600 max-w-md mb-6">
        No tienes permisos suficientes para acceder a esta sección. Esta área
        está reservada para administradores del sistema.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg p-3">
          <Lock className="h-5 w-5" />
          <span className="text-sm font-medium">
            Se requiere rol de administrador
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700 bg-gray-100 rounded-lg p-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Contacta al administrador del sistema
          </span>
        </div>
      </div>

      <div className="space-x-4">
        <Button
          onClick={() => navigate("/")}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Volver al inicio
        </Button>

        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-gray-300"
        >
          Volver atrás
        </Button>
      </div>
    </div>
  );
};

export default NoPermissionView;
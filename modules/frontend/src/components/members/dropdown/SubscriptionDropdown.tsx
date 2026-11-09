import { ChevronDown, ChevronUp } from "lucide-react";
import { getSubscriptionStatus } from "@/utils/getSubscriptionStatus";

interface Subscription {
    productName?: string;
    status?: string;
}

interface SubscriptionDropdownProps {
    subscriptions: Subscription[] | null;
    isOpen: boolean;             // Determina si este dropdown está abierto
    dropdownId: number;          // ID único para este dropdown
    onToggle: (id: number) => void; // Función para manejar la apertura/cierre
}

export default function SubscriptionDropdown({ 
    subscriptions, 
    isOpen, 
    dropdownId, 
    onToggle 
}: SubscriptionDropdownProps) {
    // Si no hay suscripciones adicionales y no hay nombre de producto, no mostrar nada
    if (!subscriptions || subscriptions.length === 0) {
        return null;
    }

    // Si no hay suscripciones adicionales, mostrar el nombre del producto
    if (subscriptions.length === 1) {
        return <span>{subscriptions[0].productName}</span>;
    }

    if (subscriptions) {
        return (
            <div className="relative">
                {/* Botón desplegable */}
                <button
                    onClick={() => onToggle(dropdownId)}
                    className="flex items-center font-bold text-sm"
                >
                    {subscriptions[0].productName}
                    {isOpen ? (
                        <ChevronUp className="ml-1 w-4 h-4" />
                    ) : (
                        <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                </button>

                {/* Contenido desplegable */}
                {isOpen && (
                    <div className="absolute z-30 mt-1 bg-white border border-gray-200 rounded shadow-lg">
                        <div className="p-2">
                            <h4 className="font-medium text-sm mb-2">Suscripciones adicionales</h4>
                            <ul className="space-y-1">
                                {subscriptions.map((subscription, index) => (
                                    <li key={index} className="text-sm">
                                        {subscription.productName}
                                        {subscription.status && ` | ${getSubscriptionStatus(subscription.status)}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Si no aplica ningún caso, devolver null
    return null;
}
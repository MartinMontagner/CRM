export const getSubscriptionStatus = (status: string) => {
    switch (status) {
        case "active":
            return "Activa";
        case "expired":
            return "Vencida";
        case "cancelled":
            return "Cancelada";
        case "pending":
            return "Pendiente";
        case "suspended":
            return "Suspendida";
        default:
            return status;
    }
};

export const getSubscriptionStatusDefault = (subscription: object) => {
    const status = convertSubscription(subscription);
    return getSubscriptionStatus(status);
}

const convertSubscription = (subscription: object) => {
    // Comprobación de existencia
    if (!subscription) {
        return "";
    }
    
    // Comprobación de existencia de la propiedad status
    if ('status' in subscription) {
        return (subscription as { status: string }).status;
    }
    
    // Si no se cumple ninguna de las condiciones anteriores, devolver un string vacío
    return "";
}

// Función que retorna blanco o negro según el fondo
export function getTextColor(isDark: boolean): string {
    return isDark ? '#FFFFFF' : '#000000';
}

// Función que retorna blanco o negro según el fondo
export function getTextColorString(backgroundColor: string): string {
    return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}

// Función simple para determinar si un color es claro u oscuro
function isLightColor(hexColor: string): boolean {
    // Remover el # si existe
    const hex = hexColor.replace('#', '');

    // Convertir a RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calcular luminancia (formula simplificada)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si luminancia > 0.5 es claro, sino es oscuro
    return luminance > 0.5;
}
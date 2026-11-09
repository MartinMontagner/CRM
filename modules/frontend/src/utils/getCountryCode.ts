import countries from '@/utils/json/countries.json';

interface Country {
  id: number;
  code: string;
  name: string;
}

/**
 * Obtiene el código de país a partir de su nombre
 * @param addressCountry Nombre del país a buscar
 * @returns Código del país o cadena vacía si no se encuentra
 */
function getCountryCode(addressCountry: string): string {
    try {
        if (!addressCountry) {
            return '';
        }
        
        // Normalizar el nombre del país para la búsqueda (convertir a mayúsculas)
        const normalizedCountryName = addressCountry.trim().toUpperCase();
        
        // Buscar el país, ya sea por nombre exacto o por comparación más flexible
        const country = countries.find((c: Country) => {
            // Comparación exacta en mayúsculas
            if (c.name === normalizedCountryName) {
                return true;
            }
            
            // Comparación más flexible si no hay coincidencia exacta
            return c.name.toUpperCase() === normalizedCountryName;
        });
        
        // Verificar si se encontró el país
        if (country && country.code) {
            return country.code;
        } else {
            console.log(`País no encontrado: ${addressCountry}`);
            return '';
        }
    } catch (error) {
        console.error(`Error al buscar el código del país ${addressCountry}:`, error);
        return '';
    }
}

export default getCountryCode;
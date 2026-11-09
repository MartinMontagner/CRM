export enum Filter {
  ALL = "ALL",
  PHONE_NUMBER = "phoneNumber",
  STUDENT_NAME = "studentName",
  STUDENT_TAG = "InterestTag",
  COUNTRY = "country",
  STUDENT_LAST_NAME = "studentLastName",
  PRODUCT = "product",
}

interface FilterContent {
  content: string;
  personalizedTag: string;
}

// Filtros principales (Tags)
export const getFilterContent = (): FilterContent[] => {
  return [
    {
      content: Filter.ALL,
      personalizedTag: "Todos",
    },
    {
      content: "INTERESADO",
      personalizedTag: "Interesado",
    },
    {
      content: "PRIMERA_REGESTION",
      personalizedTag: "Primera Regestion",
    },
    {
      content: "NO_INTERESADO",
      personalizedTag: "No Interesado",
    },
    {
      content: "COMPROMISO",
      personalizedTag: "Compromiso de Pago",
    },
    {
      content: "SEGUNDA_REGESTION",
      personalizedTag: "Segunda Regestion",
    },
  ];
};

// Filtros adicionales (select)
export const getAdvancedFilterOptions = (): FilterContent[] => {
  return [
    {
      content: Filter.COUNTRY,
      personalizedTag: "País",
    },
    {
      content: Filter.PRODUCT,
      personalizedTag: "Producto",
    },
  ];
};
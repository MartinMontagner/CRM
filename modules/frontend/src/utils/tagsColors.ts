const TagsColors: Record<string, string> = {
  LEAD: "bg-[#39BE00] text-white",        
  ALUMNO: "bg-[#1E40AF] text-white",      
  EX_ALUMNO: "bg-[#CD1414] text-white",   
};

export const getTagColor = (tag: string | undefined): string => {
  if (!tag) {
    return "bg-gray-100 text-gray-500 border-gray-200";
  }
  return TagsColors[tag] || "bg-gray-100 text-gray-500 border-gray-200";
};
import { Filter, MemberSubscription } from "../types/types";

/**
 * Filter member subscriptions based on applied filters and global filter
 */
export const filterMemberSubscriptions = (
  members: MemberSubscription[],
  appliedFilters: Filter[],
  globalFilter: string
): MemberSubscription[] => {
  if (!Array.isArray(members)) {
    return [];
  }

  if (appliedFilters.length === 0 && !globalFilter) {
    return members;
  }

  let filteredData = [...members];

  // Apply global filter if exists
  if (globalFilter) {
    const searchTerm = globalFilter.toLowerCase();
    filteredData = filteredData.filter((member) => {
      return Object.entries(member).some(([, value]) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  }

  // Apply specific filters
  if (appliedFilters.length > 0) {
    filteredData = filteredData.filter((member) => {
      return appliedFilters.every((filter) => {
        const memberValue = member[filter.field];
        if (memberValue === null || memberValue === undefined) return false;
        
        return String(memberValue)
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      });
    });
  }

  return filteredData;
};

/**
 * Convert DTO to member subscription object with default values
 */
export const convertDTOToMemberSubscription = (
  item: any
): MemberSubscription => ({
  ...item,
  id: item.id || 0,
  email: item.email || "",
  firstName: item.firstName || "",
  lastName: item.lastName || "",
  phone: item.phone || "",
  status: item.status || "",
  productName: item.productName || "",
  addressCountry: item.addressCountry || "",
  registered: item.registered || "",
  activeTxnCount: item.activeTxnCount || "",
  expiredTxnCount: item.expiredTxnCount || 0,
  latestTxnDate: item.latestTxnDate || "",
  lastLoginDate: item.lastLoginDate || "",
  subscriptions: item.subscriptions || [],
});

// En un archivo utils, por ejemplo displayUtils.ts
export const formatCategoryDisplay = (category: string | null | undefined): string => {
  if (!category) return "Sin categoría";
  
  switch (category) {
    case "LEAD":
      return "LEAD";
    case "ALUMNO": 
      return "ALUMNO";
    case "EX_ALUMNO":
      return "EX ALUMNO";
    default:
      return category;
  }
};
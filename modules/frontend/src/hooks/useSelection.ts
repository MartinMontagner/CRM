import { useState } from "react";
import { MemberSubscription } from "../types/types";

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Toggle selection for a single member
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Toggle selection for all visible members
  const toggleSelectAll = (members: MemberSubscription[]) => {
    const memberIds = members.map((member) => member.id);
    
    if (members.every((member) => selectedIds.includes(member.id))) {
      // If all are selected, unselect all
      setSelectedIds(selectedIds.filter((id) => !memberIds.includes(id)));
    } else {
      // Otherwise, select all (avoiding duplicates)
      const newSelectedIds = [...new Set([...selectedIds, ...memberIds])];
      setSelectedIds(newSelectedIds);
    }
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Get selection status for all visible members
  const getSelectionStatus = (members: MemberSubscription[]) => {
    if (members.length === 0) return "none";
    if (members.every((member) => selectedIds.includes(member.id))) return "all";
    if (members.some((member) => selectedIds.includes(member.id))) return "partial";
    return "none";
  };

  // Get selected phone numbers (for message sending)
  const getSelectedPhoneNumbers = (members: MemberSubscription[]): number[] => {
    return members
      .filter((member) => selectedIds.includes(member.id))
      .map((member) => {
        const phoneNumber = member.phone ? Number(member.phone) : NaN;
        return phoneNumber;
      })
      .filter((phone) => !isNaN(phone));
  };

  return {
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    getSelectionStatus,
    getSelectedPhoneNumbers,
  };
};
import React from "react";
import { Button } from "@mantine/core";
import { SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface ActionBarProps {
  selectedCount: number;
  onOpenSendMessageModal: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  onOpenSendMessageModal,
}) => {
  if (selectedCount === 0) {
    return <></>;
  }

  return (
    <motion.div
      className="flex justify-between items-center bg-primary-600 pl-4 mb-1 py-2 w-full rounded-b-md"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }} 
      exit={{ y: 50, opacity: 0 }} 
      transition={{ duration: 0.3 }} 
    >
      <span className="font-semibold text-white">
        {selectedCount} {selectedCount === 1 ? "seleccionado" : "seleccionados"}
      </span>

      <Button
        className="border-2 text-white bg-primary-600 hover:bg-primary-600"
        onClick={onOpenSendMessageModal}
      >
        <SendHorizontal className="w-6 h-6 text-white hover:animate-shake" />
      </Button>
    </motion.div>
  );
};

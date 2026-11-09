import React, { useState } from 'react';
import { ChevronDown, Mail, MailOpen, List } from 'lucide-react';
import { ReadStatusType } from '@/model/chats/ReadStatusType';

interface ReadStatusSelectorProps {
    selectedStatus: ReadStatusType;
    onStatusChange: (status: ReadStatusType) => void;
}

const ReadStatusSelector: React.FC<ReadStatusSelectorProps> = ({
    selectedStatus,
    onStatusChange
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const statusOptions = [
        { value: "ALL" as ReadStatusType, label: "Todos", icon: List },
        { value: "READ" as ReadStatusType, label: "Leídos", icon: MailOpen },
        { value: "UNREAD" as ReadStatusType, label: "No leídos", icon: Mail },
    ];

    const selectedOption = statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];
    const SelectedIcon = selectedOption.icon;

    const handleStatusSelect = (status: ReadStatusType) => {
        onStatusChange(status);
        setIsOpen(false);
    };

    return (
        <div className="relative z-30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-tertiary-400"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <SelectedIcon size={14} className="text-gray-600" />
                <span className="text-gray-700">{selectedOption.label}</span>
                <ChevronDown size={14} className="text-gray-600" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-md z-10">
                    <ul role="listbox" className="py-1">
                        {statusOptions.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                                <li key={option.value}>
                                    <button
                                        onClick={() => handleStatusSelect(option.value)}
                                        className={`w-full flex items-center gap-1 px-2 py-1 text-xs text-left hover:bg-gray-100 ${selectedStatus === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                            }`}
                                        role="option"
                                        aria-selected={selectedStatus === option.value}
                                    >
                                        <OptionIcon size={14} className="text-gray-600" />
                                        {option.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReadStatusSelector;
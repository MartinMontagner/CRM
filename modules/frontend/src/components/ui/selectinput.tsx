interface SelectInputProps {
    options: { id: string; name: string }[];
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    options,
    value,
    onChange,
    placeholder,
    disabled = false
}) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={` bg-white rounded-md flex h-10 w-full px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-grey-500 text-grey-700  focus-visible:border-primary-light focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${disabled ? 'bg-gray-100 text-gray-400' : ''}`}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.name}
                </option>
            ))}
        </select>
    );
};
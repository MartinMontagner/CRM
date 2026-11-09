import { FC } from 'react';

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}

export const Select: FC<SelectProps> = ({ value, onValueChange, children }) => {
    return (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
        <option value="" disabled selected>
        Selecciona una categoría
        </option>
        {children}
    </select>
    );
};

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
}

export const SelectItem: FC<SelectItemProps> = ({ value, children }) => {
    return <option value={value}>{children}</option>;
};
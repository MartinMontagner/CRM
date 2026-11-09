interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  value: string;
  onChange: ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const FormField = ({ 
  id, 
  label, 
  type = "text", 
  as = "input",
  value, 
  onChange, 
  placeholder, 
  className = "",
  required 
}: FormFieldProps) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      {as === "input" ? (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
        />
      ) : (
        <textarea
          id={id}
          value={value}
          onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          required={required}
        />
      )}
    </div>
  );
};
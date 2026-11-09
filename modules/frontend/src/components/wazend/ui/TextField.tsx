import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

export const TextField = ({
  label,
  error,
  fullWidth = false,
  className = "",
  ...props
}: TextFieldProps) => {
  return (
    <div className={`mb-4 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        className={`shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
          border-gray-300 rounded-md ${
            error ? "border-red-300" : ""
          } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const Label = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-semibold text-gray-800 mb-2"
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "rounded-md flex h-10 w-full px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-grey-700 text-grey-700  focus-visible:border-primary-light focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                    error
                        ? "border-red-500 placeholder:text-red-500 focus-visible:border-2 focus-visible:border-red-500"
                        : "",
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };

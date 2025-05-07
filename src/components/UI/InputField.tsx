import React, { forwardRef } from "react"; 

interface InputProps {
  id?: string;
  label?: string;
  type: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg"; 
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, type, value, onChange, placeholder = "", className = "", disabled = false, readOnly = false, size = "md" }: InputProps, ref) => {
    const baseStyles = "w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B5252]";
    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    const sizeStyles = {
      sm: "text-sm p-1",  
      md: "text-base p-2", 
      lg: "text-lg p-3",  
    };

    return (
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseStyles} ${sizeStyles[size]} ${disabledStyles} ${className}`}
        disabled={disabled}
        readOnly={readOnly}
      />
    );
  }
);

export { Input };

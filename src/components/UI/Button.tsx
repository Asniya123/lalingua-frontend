import React from 'react';

interface ButtonProps {
  children: React.ReactNode; // Explicitly typing children as ReactNode
  className?: string;
  variant?: "outline" | "filled"; // You can specify the valid variants
  size?: "sm" | "lg"; // You can specify the valid sizes
  onClick: React.MouseEventHandler<HTMLButtonElement>; // Typing onClick handler
  type?: "button" | "submit" | "reset"; // Typing the type prop, defaults to "button"
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'filled', // default value for variant
  size = 'sm', // default value for size
  onClick,
  type = "button",
}) => {
  const baseStyles = "px-4 py-2 rounded-md focus:outline-none";
  const variantStyles = variant === "outline" ? "border border-gray-300" : "bg-blue-600 text-white";
  const sizeStyles = size === "lg" ? "text-lg" : "text-sm";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export { Button };

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; 
  variant?: "default" | "outline" | "ghost" | "secondary"; 
  size?: "sm" | "md" | "lg" | 'icon'; 
  className?: string; 
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "md", 
  className,
  ...props
}) => {
  const baseStyles =
    "rounded-lg font-medium focus:outline-none transition";
  
  const variants = {
    default: "bg-black-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
    ghost: "text-gray-800 hover:bg-gray-100",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2 w-10 h-10 flex items-center justify-center", // Example styles for icon buttons
  };
  

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

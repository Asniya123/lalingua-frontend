import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'outline' | 'filled' | 'default' | 'light' | 'ghost';
  size?: 'sm' | 'lg' | 'icon';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isIconOnly?: boolean;
  color?: 'primary' | 'secondary' | 'danger';
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'filled',
  size = 'sm',
  onClick,
  type = 'button',
  disabled = false,
  isIconOnly = false,
  color = 'primary',
  title,
}) => {
  const baseStyles = 'rounded-md focus:outline-none transition-colors duration-200';

  const variantStyles = {
    filled: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    light: {
      primary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    outline: {
      primary: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
      secondary: 'border border-gray-600 text-gray-600 hover:bg-gray-50',
      danger: 'border border-red-600 text-red-600 hover:bg-red-50',
    },
    default: {
      primary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    },
    ghost: {
      primary: 'text-blue-600 hover:bg-blue-50',
      secondary: 'text-gray-600 hover:bg-gray-50',
      danger: 'text-red-600 hover:bg-red-50',
    },
  };

  const selectedVariant = variantStyles[variant]?.[color] || '';
  const sizeStyles =
    size === 'lg' ? 'text-lg px-5 py-3' : size === 'icon' ? 'p-2 h-8 w-8' : 'text-sm px-3 py-2';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const iconOnlyStyles = isIconOnly ? 'p-2 h-8 w-8' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${sizeStyles} ${iconOnlyStyles} ${disabledStyles} ${className}`}
      title={title}
    >
      {children}
    </button>
  );
};

export { Button };
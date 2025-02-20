import React from 'react';

interface InputProps {
  id: string;  // id should be a string
  type: string;  // type should be a string
  placeholder: string;  // placeholder should be a string
  className?: string;  // className is optional, type is string
  autoComplete?: string;  // autoComplete is optional, type is string
  autoCorrect?: string;  // autoCorrect is optional, type is string
  autoCapitalize?: string;  // autoCapitalize is optional, type is string
}

const Input: React.FC<InputProps> = ({
  id,
  type,
  placeholder,
  className = '',
  autoComplete,
  autoCorrect,
  autoCapitalize,
}) => {
  const baseStyles = "border rounded-md p-2 w-full";

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`${baseStyles} ${className}`}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      autoCapitalize={autoCapitalize}
    />
  );
};

export { Input };

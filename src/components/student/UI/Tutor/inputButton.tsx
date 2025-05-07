import React, { ChangeEvent } from 'react';

interface InputProps {
  id: string;
  type: string;
  name: string; // Add name prop
  value: string | number; // Allow string or number for value
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  step?: string; // Optional for number inputs with step
}

export const Input: React.FC<InputProps> = ({
  id,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  className,
  step,
}) => {
  return (
    <input
      id={id}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
      step={step}
    />
  );
};
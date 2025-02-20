interface InputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean; // Make the required prop optional
    className?: string;
  }
  
  export const Input: React.FC<InputProps> = ({
    id,
    type,
    placeholder,
    value,
    onChange,
    required = false, // Default value is false
    className,
  }) => {
    return (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`input ${className}`}
      />
    );
  };
  
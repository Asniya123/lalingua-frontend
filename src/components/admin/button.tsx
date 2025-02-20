interface ButtonProps {
    onClick?: () => void;
    type?: "button" | "submit" | "reset"; // Accepts all valid button types
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
  }
  
  export const Button: React.FC<ButtonProps> = ({
    onClick,
    type = "button",
    disabled = false,
    className,
    children,
  }) => {
    return (
      <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={`btn ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {children}
      </button>
    );
  };
  
import React from "react";

interface CardProps {
  children: React.ReactNode; // Explicitly type the children prop
  className?: string; // Optional className prop
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const baseStyles = "shadow-lg rounded-lg bg-white p-6";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

export { Card };

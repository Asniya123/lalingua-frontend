
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardSubComponentProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  const baseStyles = "shadow-lg rounded-lg bg-white border border-gray-200";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

const CardHeader: React.FC<CardSubComponentProps> = ({ children, className = "" }) => {
  const baseStyles = "p-6 pb-0";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

const CardContent: React.FC<CardSubComponentProps> = ({ children, className = "" }) => {
  const baseStyles = "p-6";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

const CardFooter: React.FC<CardSubComponentProps> = ({ children, className = "" }) => {
  const baseStyles = "p-6 pt-0";

  return <div className={`${baseStyles} ${className}`}>{children}</div>;
};

export { Card, CardHeader, CardContent, CardFooter };
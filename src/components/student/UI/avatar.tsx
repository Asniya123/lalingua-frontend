import React, { ReactNode } from "react";

interface AvatarProps {
  children: ReactNode;
  className?: string;
}

interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

interface AvatarFallbackProps {
  children: ReactNode;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
};

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = "" }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover w-full h-full ${className}`}
    />
  );
};

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-400 text-white ${className}`}
    >
      {children}
    </div>
  );
};
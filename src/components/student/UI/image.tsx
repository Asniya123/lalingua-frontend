// components/student/UI/image.tsx

import React, { ImgHTMLAttributes } from "react";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string; // URL for the image
  alt: string; // Alternative text for the image
  className?: string; // Optional additional classes
  fill?: boolean; // Custom property for "fill" behavior
}

interface Expert {
  name: string;
  image: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className, fill, ...props }) => {
  return (
    <div
      className={`relative ${fill ? "w-full h-full" : ""} ${className || ""}`}
    >
      <img
        src={src}
        alt={alt}
        className={`object-cover w-full h-full rounded-lg`}
        {...props}
      />
    </div>
  );
};




export default Image;

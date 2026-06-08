"use client";

import Image from "next/image";
import { useState } from "react";

type RemoteImageProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackClassName?: string;
};

const RemoteImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackClassName = "",
}: RemoteImageProps) => {
  const [failed, setFailed] = useState(false);
  const initial = alt.trim()[0]?.toUpperCase() ?? "?";

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 text-gray-500 font-semibold ${fallbackClassName || className}`}
        style={{ width, height }}
        aria-label={alt}
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
};

export default RemoteImage;

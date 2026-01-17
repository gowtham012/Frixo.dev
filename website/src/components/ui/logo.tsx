"use client";

import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Dark mode logo (for dark backgrounds) - colored SVG with cyan arrow, orange arrow, white text
export function LogoDark({ className = "", size = "md" }: LogoProps) {
  // SVG aspect ratio is ~2:1 (width:height)
  const sizes = {
    sm: { height: 44, width: 86 },
    md: { height: 56, width: 109 },
    lg: { height: 72, width: 140 },
    xl: { height: 96, width: 187 },
  };

  const { height, width } = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo-dark.svg"
        alt="Pitlane"
        width={width}
        height={height}
        priority
      />
    </div>
  );
}

// Light mode logo (for light backgrounds) - original black colors
export function Logo({ className = "", size = "md" }: LogoProps) {
  // SVG aspect ratio is ~2:1 (width:height)
  const sizes = {
    sm: { height: 44, width: 86 },
    md: { height: 56, width: 109 },
    lg: { height: 72, width: 140 },
    xl: { height: 96, width: 187 },
  };

  const { height, width } = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="Pitlane"
        width={width}
        height={height}
        priority
      />
    </div>
  );
}

// Icon only version - colored for dark backgrounds
export function LogoIcon({ size = 50 }: { size?: number }) {
  return (
    <Image
      src="/logo-dark.svg"
      alt="Pitlane"
      width={size * 2}
      height={size}
      priority
    />
  );
}

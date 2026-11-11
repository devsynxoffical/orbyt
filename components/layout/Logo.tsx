"use client";

import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  showText?: boolean;
  className?: string;
  imageClassName?: string;
  variant?: "default" | "light" | "collab" | "dashboard" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  onClick?: () => void;
};

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "h-7 sm:h-8",
  md: "h-8 sm:h-9",
  lg: "h-9 sm:h-10 lg:h-11",
  xl: "h-11 sm:h-12 lg:h-14",
};

export function Logo({
  className = "",
  imageClassName = "",
  variant = "default",
  size = "lg",
  href = "/",
  onClick,
}: LogoProps) {
  // dark or collab on dark backgrounds uses logo-on-dark.webp
  const isDark = variant === "dark" || variant === "collab";
  const src = isDark ? "/logo-on-dark.webp" : "/logo-transparent.webp";
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.lg;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center transition-all duration-200 hover:opacity-95 active:scale-[0.99] ${className}`}
      aria-label="Orbyt Rush home"
    >
      <Image
        src={src}
        alt="Orbyt Rush"
        width={380}
        height={70}
        quality={100}
        className={`${sizeClass} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02] ${imageClassName}`}
        priority
      />
    </Link>
  );
}

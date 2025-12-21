import type { FC, SVGProps } from "react";
import { cn } from "@/lib/utils";

interface FeaturedIconProps {
  icon: FC<SVGProps<SVGSVGElement>>;
  size?: "sm" | "md" | "lg";
  color?: "brand" | "primary" | "secondary" | "gray";
  theme?: "light" | "dark" | "modern";
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const colorClasses = {
  brand: {
    light: "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400",
    dark: "bg-primary-900 text-primary-400",
  },
  primary: {
    light: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dark: "bg-gray-800 text-gray-400",
  },
  secondary: {
    light: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dark: "bg-gray-800 text-gray-400",
  },
  gray: {
    light: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dark: "bg-gray-800 text-gray-400",
  },
};

export function FeaturedIcon({
  icon: Icon,
  size = "md",
  color = "brand",
  theme = "light",
  className,
}: FeaturedIconProps) {
  const sizeClass = sizeClasses[size];
  // "modern" theme uses the same styling as "light"
  const themeKey = theme === "modern" ? "light" : theme;
  const colorClass = colorClasses[color][themeKey];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg",
        sizeClass,
        colorClass,
        className
      )}
    >
      <Icon className={size === "sm" ? "h-5 w-5" : size === "md" ? "h-6 w-6" : "h-7 w-7"} />
    </div>
  );
}


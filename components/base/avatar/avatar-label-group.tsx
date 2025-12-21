"use client";

import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarLabelGroupProps {
  size?: "sm" | "md" | "lg";
  src?: string;
  alt?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

const sizeClasses = {
  sm: {
    avatar: "h-8 w-8",
    title: "text-sm",
    subtitle: "text-xs",
    gap: "gap-2",
  },
  md: {
    avatar: "h-10 w-10",
    title: "text-base",
    subtitle: "text-sm",
    gap: "gap-3",
  },
  lg: {
    avatar: "h-12 w-12",
    title: "text-lg",
    subtitle: "text-base",
    gap: "gap-4",
  },
};

export function AvatarLabelGroup({
  size = "md",
  src,
  alt,
  title,
  subtitle,
  className,
}: AvatarLabelGroupProps) {
  const sizes = sizeClasses[size];
  const initials = title
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex items-center", sizes.gap, className)}>
      <Avatar className={sizes.avatar}>
        {src && <AvatarImage src={src} alt={alt || title} />}
        <AvatarFallback className="bg-[#002A1F] text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className={cn("font-medium text-gray-900 dark:text-gray-100", sizes.title)}>
          {title}
        </span>
        {subtitle && (
          <span className={cn("text-gray-500 dark:text-gray-400", sizes.subtitle)}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}


import * as React from "react";
import { cn } from "@/lib/utils";
import type { BadgeTypes } from "./badge-types";

interface BadgeWithDotProps {
    color?: "success" | "warning" | "error" | "info";
    type?: "modern" | "classic";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
}

export function BadgeWithDot({ 
    color = "success", 
    type = "modern", 
    size = "sm",
    children,
    className 
}: BadgeWithDotProps) {
    const colorClasses = {
        success: "bg-[#4ADE80]",
        warning: "bg-[#F59E0B]",
        error: "bg-[#EF4444]",
        info: "bg-[#002A1F]",
    };

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-medium",
                sizeClasses[size],
                type === "modern" 
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    : "bg-white text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", colorClasses[color])} />
            {children}
        </span>
    );
}

export type BadgeColor<T extends BadgeTypes> = T;

interface BadgeProps {
    color?: BadgeColor<BadgeTypes>;
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
}

const badgeColorClasses: Record<BadgeTypes, string> = {
    default: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const badgeSizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
};

export function Badge({ 
    color = "gray", 
    size = "sm",
    children,
    className 
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-medium",
                badgeSizeClasses[size],
                badgeColorClasses[color],
                className
            )}
        >
            {children}
        </span>
    );
}






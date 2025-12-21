"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    type?: "line-spinner" | "spinner" | "dots";
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
}

const sizeClasses = {
    sm: {
        spinner: "h-4 w-4",
        line: "h-1",
        text: "text-sm",
    },
    md: {
        spinner: "h-8 w-8",
        line: "h-1.5",
        text: "text-base",
    },
    lg: {
        spinner: "h-12 w-12",
        line: "h-2",
        text: "text-lg",
    },
};

export function LoadingIndicator({ 
    type = "line-spinner", 
    size = "md", 
    label,
    className 
}: LoadingIndicatorProps) {
    const sizes = sizeClasses[size];

    if (type === "line-spinner") {
        return (
            <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
                <div className="relative w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div 
                        className={cn(
                            "rounded-full bg-[#002A1F] animate-[loading-line_1.5s_ease-in-out_infinite]",
                            sizes.line
                        )}
                    />
                </div>
                {label && (
                    <p className={cn("text-gray-600 dark:text-gray-400", sizes.text)}>
                        {label}
                    </p>
                )}
            </div>
        );
    }

    if (type === "spinner") {
        return (
            <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
                <div 
                    className={cn(
                        "animate-spin rounded-full border-2 border-gray-300 border-t-[#002A1F]",
                        sizes.spinner
                    )}
                />
                {label && (
                    <p className={cn("text-gray-600 dark:text-gray-400", sizes.text)}>
                        {label}
                    </p>
                )}
            </div>
        );
    }

    // Dots type
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="flex gap-1">
                <div 
                    className={cn(
                        "animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-[#002A1F]",
                        sizes.spinner
                    )}
                    style={{ animationDelay: "0s" }}
                />
                <div 
                    className={cn(
                        "animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-[#002A1F]",
                        sizes.spinner
                    )}
                    style={{ animationDelay: "0.2s" }}
                />
                <div 
                    className={cn(
                        "animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-[#002A1F]",
                        sizes.spinner
                    )}
                    style={{ animationDelay: "0.4s" }}
                />
            </div>
            {label && (
                <p className={cn("text-gray-600 dark:text-gray-400", sizes.text)}>
                    {label}
                </p>
            )}
        </div>
    );
}


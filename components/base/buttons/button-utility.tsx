import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ButtonUtilityProps {
    size?: "xs" | "sm" | "md" | "lg";
    color?: "primary" | "secondary" | "tertiary";
    tooltip?: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    className?: string;
}

const sizeClasses = {
    xs: "h-8 w-8",
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
};

const colorClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
    tertiary: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
};

export function ButtonUtility({ 
    size = "sm", 
    color = "tertiary", 
    tooltip, 
    icon: Icon, 
    onClick,
    className 
}: ButtonUtilityProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
                sizeClasses[size],
                colorClasses[color],
                "p-0",
                className
            )}
            title={tooltip}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}






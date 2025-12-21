import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItemTextProps {
  text: string;
  size?: "sm" | "md" | "lg";
  iconStyle?: "outlined" | "filled";
  color?: "primary" | "secondary" | "brand";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const colorClasses = {
  primary: "text-gray-900 dark:text-gray-100",
  secondary: "text-gray-600 dark:text-gray-400",
  brand: "text-primary-600 dark:text-primary-400",
};

export function CheckItemText({
  text,
  size = "md",
  iconStyle = "outlined",
  color = "primary",
  className,
}: CheckItemTextProps) {
  return (
    <li className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "mt-0.5 flex-shrink-0",
          iconSizeClasses[size],
          color === "brand"
            ? "text-primary-600 dark:text-primary-400"
            : "text-gray-600 dark:text-gray-400"
        )}
      >
        <Check className={cn("h-full w-full", iconStyle === "outlined" && "stroke-2")} />
      </div>
      <span className={cn(sizeClasses[size], colorClasses[color])}>{text}</span>
    </li>
  );
}





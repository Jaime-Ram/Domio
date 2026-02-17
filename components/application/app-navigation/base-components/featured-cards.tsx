import * as React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedCardProgressBarProps {
    title: string;
    description: string;
    confirmLabel: string;
    progress: number;
    className?: string;
    onDismiss?: () => void;
    onConfirm?: () => void;
}

export function FeaturedCardProgressBar({
    title,
    description,
    confirmLabel,
    progress,
    className,
    onDismiss,
    onConfirm,
}: FeaturedCardProgressBarProps) {
    return (
        <div
            className={cn(
                "relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900",
                className
            )}
        >
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            <div className="pr-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {description}
                </p>
                <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{progress}%</span>
                        <span>100%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                            className="h-full bg-[#163300] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                {onConfirm && (
                    <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}





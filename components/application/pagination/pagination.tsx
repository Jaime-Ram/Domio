"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationPageMinimalCenterProps {
    page: number;
    total: number;
    className?: string;
    onPageChange?: (page: number) => void;
}

export function PaginationPageMinimalCenter({ 
    page, 
    total, 
    className,
    onPageChange 
}: PaginationPageMinimalCenterProps) {
    const handlePrevious = () => {
        if (page > 1 && onPageChange) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < total && onPageChange) {
            onPageChange(page + 1);
        }
    };

    return (
        <div className={cn("flex items-center justify-center gap-2", className)}>
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={page === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
                Pagina {page} van {total}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={page === total}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}






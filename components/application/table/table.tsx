"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface SortDescriptor {
    column: string;
    direction: "ascending" | "descending";
}

interface TableProps {
    "aria-label": string;
    selectionMode?: "none" | "single" | "multiple";
    sortDescriptor?: SortDescriptor;
    onSortChange?: (sortDescriptor: SortDescriptor) => void;
    children: React.ReactNode;
    className?: string;
}

const Table = ({ 
    "aria-label": ariaLabel,
    selectionMode,
    sortDescriptor,
    onSortChange,
    children,
    className 
}: TableProps) => {
    return (
        <table
            aria-label={ariaLabel}
            className={cn("w-full border-collapse", className)}
        >
            {children}
        </table>
    );
};

interface TableHeaderProps {
    children: React.ReactNode;
}

const TableHeader = ({ children }: TableHeaderProps) => {
    return (
        <thead className="border-b">
            <tr>
                {children}
            </tr>
        </thead>
    );
};

interface TableHeadProps {
    id?: string;
    label?: string;
    isRowHeader?: boolean;
    allowsSorting?: boolean;
    tooltip?: string;
    className?: string;
    children?: React.ReactNode;
    sortDescriptor?: SortDescriptor;
    onSortChange?: (sortDescriptor: SortDescriptor) => void;
}

const TableHead = ({ 
    id, 
    label, 
    isRowHeader, 
    allowsSorting, 
    tooltip, 
    className,
    children,
    sortDescriptor,
    onSortChange
}: TableHeadProps) => {
    const handleSort = () => {
        if (!allowsSorting || !onSortChange || !id) return;
        
        const newDirection = 
            sortDescriptor?.column === id && sortDescriptor?.direction === "ascending"
                ? "descending"
                : "ascending";
        
        onSortChange({
            column: id,
            direction: newDirection,
        });
    };

    const isSorted = sortDescriptor?.column === id;
    const sortDirection = isSorted ? sortDescriptor.direction : null;

    return (
        <th
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-gray-600 dark:text-gray-400",
                allowsSorting && "cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800",
                className
            )}
            title={tooltip}
            onClick={allowsSorting ? handleSort : undefined}
        >
            <div className="flex items-center gap-2">
                {label || children}
                {allowsSorting && (
                    <div className="flex flex-col">
                        <ChevronUp 
                            className={cn(
                                "h-3 w-3 transition-colors",
                                sortDirection === "ascending" 
                                    ? "text-[#002A1F]" 
                                    : "text-gray-400"
                            )}
                        />
                        <ChevronDown 
                            className={cn(
                                "h-3 w-3 -mt-1 transition-colors",
                                sortDirection === "descending" 
                                    ? "text-[#002A1F]" 
                                    : "text-gray-400"
                            )}
                        />
                    </div>
                )}
            </div>
        </th>
    );
};

interface TableBodyProps {
    items: any[];
    children: (item: any) => React.ReactNode;
}

const TableBody = ({ items, children }: TableBodyProps) => {
    return (
        <tbody>
            {items.map((item) => {
                const rowContent = children(item);
                const itemId = item.id || item.username || JSON.stringify(item);
                return (
                    <tr 
                        key={itemId} 
                        id={itemId}
                        className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        {rowContent}
                    </tr>
                );
            })}
        </tbody>
    );
};

interface TableRowProps {
    id: string;
    children: React.ReactNode;
}

const TableRow = ({ children }: TableRowProps) => {
    return <>{children}</>;
};

interface TableCellProps {
    className?: string;
    children: React.ReactNode;
}

const TableCell = ({ className, children }: TableCellProps) => {
    return (
        <td className={cn("px-4 py-3 align-middle", className)}>
            {children}
        </td>
    );
};

Table.Header = TableHeader;
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export { Table };
export type { SortDescriptor };


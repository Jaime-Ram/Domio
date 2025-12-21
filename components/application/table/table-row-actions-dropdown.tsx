"use client";

import * as React from "react";
import { MoreVertical, Download, Filter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TableRowActionsDropdownProps {
    onExport?: () => void;
    onFilter?: () => void;
}

export function TableRowActionsDropdown({ onExport, onFilter }: TableRowActionsDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onExport && (
                    <DropdownMenuItem onClick={onExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Exporteren
                    </DropdownMenuItem>
                )}
                {onFilter && (
                    <DropdownMenuItem onClick={onFilter}>
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableCardRootProps {
    children: React.ReactNode;
    className?: string;
}

const TableCardRoot = ({ children, className }: TableCardRootProps) => {
    return (
        <Card className={cn("overflow-hidden", className)}>
            {children}
        </Card>
    );
};

interface TableCardHeaderProps {
    title: string;
    badge?: string;
    contentTrailing?: React.ReactNode;
}

const TableCardHeader = ({ title, badge, contentTrailing }: TableCardHeaderProps) => {
    return (
        <CardHeader className="relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CardTitle>{title}</CardTitle>
                    {badge && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            {contentTrailing}
        </CardHeader>
    );
};

TableCardRoot.Root = TableCardRoot;
TableCardRoot.Header = TableCardHeader;

export const TableCard = TableCardRoot;






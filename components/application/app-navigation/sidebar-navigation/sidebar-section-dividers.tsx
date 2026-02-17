"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import type { NavItemType, NavItemDividerType, NavItemSectionHeaderType } from "../config";

interface SidebarNavigationSectionDividersProps {
    items: (NavItemType | NavItemDividerType | NavItemSectionHeaderType)[];
    activeUrl?: string;
    footerItems?: NavItemType[];
}

export function SidebarNavigationSectionDividers({
    items,
    activeUrl,
    footerItems = [],
}: SidebarNavigationSectionDividersProps) {
    const pathname = usePathname();
    const active = activeUrl || pathname;

    const isActive = (href: string) => {
        return active === href || active.startsWith(`${href}/`);
    };

    const renderNavItem = (item: NavItemType) => {
        const itemActive = isActive(item.href);
        const Icon = item.icon;

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick ? (e) => {
                    e.preventDefault();
                    item.onClick?.();
                } : undefined}
                className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    itemActive
                        ? "bg-[#163300]/10 text-[#163300] dark:bg-[#163300]/20"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
            >
                <div className="flex items-center gap-3">
                    {typeof Icon === 'function' ? (
                        <Icon className="h-4 w-4 shrink-0" />
                    ) : (
                        <Icon className="h-4 w-4 shrink-0" />
                    )}
                    <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                    <div className="flex items-center text-xs">
                        {item.badge}
                    </div>
                )}
            </Link>
        );
    };

    // Filter items - hide section headers and dividers
    const filteredItems = items.filter(item => {
        if ('sectionHeader' in item || ('divider' in item && item.divider)) {
            return false; // Hide section headers and dividers
        }
        return true;
    });

    return (
        <div className="fixed left-0 top-0 flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Logo */}
            <div className="flex h-14 shrink-0 items-center px-4 pt-8 pb-6">
                <Logo width={140} height={36} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className="space-y-1">
                    {filteredItems.map((item, index) => {
                        if ('divider' in item && item.divider) {
                            return null; // Hide dividers
                        }
                        if ('sectionHeader' in item && item.sectionHeader) {
                            return null; // Hide section headers
                        }
                        // Render items
                        const navItem = item as NavItemType;
                        return renderNavItem(navItem);
                    })}
                </div>
            </nav>

            {/* Footer - Fixed at bottom */}
            {footerItems.length > 0 && (
                <div className="mt-auto shrink-0 px-3 py-3">
                    <div className="space-y-1">
                        {footerItems.map((item) => renderNavItem(item))}
                    </div>
                </div>
            )}
        </div>
    );
}









"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItemType } from "../config";

interface SidebarNavigationSimpleProps {
    items: NavItemType[];
    footerItems?: NavItemType[];
    featureCard?: React.ReactNode;
}

export function SidebarNavigationSimple({
    items,
    footerItems = [],
    featureCard,
}: SidebarNavigationSimpleProps) {
    const pathname = usePathname();
    const [openItems, setOpenItems] = React.useState<string[]>([]);

    const toggleItem = (href: string) => {
        setOpenItems((prev) =>
            prev.includes(href)
                ? prev.filter((item) => item !== href)
                : [...prev, href]
        );
    };

    const isActive = (href: string) => {
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const renderNavItem = (item: NavItemType, level = 0) => {
        const hasChildren = item.items && item.items.length > 0;
        const isOpen = openItems.includes(item.href);
        const active = isActive(item.href);

        return (
            <div key={item.href}>
                {hasChildren ? (
                    <>
                        <button
                            onClick={() => toggleItem(item.href)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                active
                                    ? "bg-[#163300]/10 text-[#163300] dark:bg-[#163300]/20"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                                level > 0 && "pl-8"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    isOpen && "rotate-90"
                                )}
                            />
                        </button>
                        {isOpen && (
                            <div className="mt-1 space-y-1 pl-4">
                                {item.items?.map((child) =>
                                    renderNavItem(child, level + 1)
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        href={item.href}
                        className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                                ? "bg-[#163300]/10 text-[#163300] dark:bg-[#163300]/20"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                            level > 0 && "pl-8"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                        </div>
                        {item.badge && (
                            <span className="rounded-full bg-[#163300] px-2 py-0.5 text-xs font-medium text-white">
                                {typeof item.badge === "number" ? item.badge : item.badge}
                            </span>
                        )}
                    </Link>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Logo */}
            <div className="flex h-16 items-center px-4">
                <Logo width={140} height={36} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                    {items.map((item) => renderNavItem(item))}
                </div>
            </nav>

            {/* Feature Card */}
            {featureCard && (
                <div className="p-4">
                    {featureCard}
                </div>
            )}

            {/* Footer Items */}
            {footerItems.length > 0 && (
                <div className="p-4">
                    <div className="space-y-1">
                        {footerItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(item.href)
                                        ? "bg-[#163300]/10 text-[#163300] dark:bg-[#163300]/20"
                                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span className="shrink-0">
                                        {typeof item.badge === "number" ? (
                                            <span className="rounded-full bg-[#163300] px-2 py-0.5 text-xs font-medium text-white">
                                                {item.badge}
                                            </span>
                                        ) : (
                                            item.badge
                                        )}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}





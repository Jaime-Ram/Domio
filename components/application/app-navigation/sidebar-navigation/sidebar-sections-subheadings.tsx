"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import type { NavItemType } from "../config";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";

interface SidebarNavigationSectionsSubheadingsProps {
    items: Array<{ label: string; items: NavItemType[] }>;
    activeUrl?: string;
    footerItems?: NavItemType[];
    userAvatar?: {
        src?: string;
        alt?: string;
        title: string;
        subtitle?: string;
    };
}

export function SidebarNavigationSectionsSubheadings({
    items,
    activeUrl,
    footerItems = [],
    userAvatar,
}: SidebarNavigationSectionsSubheadingsProps) {
    const pathname = usePathname();
    const active = activeUrl || pathname;

    const isActive = (href: string) => {
        return active === href || active.startsWith(`${href}/`);
    };

    const renderNavItem = (item: NavItemType) => {
        const active = isActive(item.href);
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
                    active
                        ? "bg-[#163300]/10 text-[#163300] dark:bg-[#163300]/20"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
            >
                <div className="flex items-center gap-3">
                    {typeof Icon === 'function' ? (
                        <Icon />
                    ) : (
                        <Icon className="h-5 w-5 shrink-0" />
                    )}
                    <span>{item.label}</span>
                </div>
                {item.badge && (
                    <div className="flex items-center">
                        {item.badge}
                    </div>
                )}
            </Link>
        );
    };

    return (
        <div className="fixed left-0 top-0 flex h-screen w-56 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <Logo width={140} height={36} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-8">
                    {items.map((section) => (
                        <div key={section.label}>
                            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                {section.label}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => renderNavItem(item))}
                            </div>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Footer - Fixed at bottom */}
            <div className="mt-auto shrink-0">
                {userAvatar && (
                    <div className="px-4 py-3">
                        <AvatarLabelGroup
                            size="sm"
                            src={userAvatar.src}
                            alt={userAvatar.alt}
                            title={userAvatar.title}
                            subtitle={userAvatar.subtitle}
                        />
                    </div>
                )}
                {footerItems.length > 0 && (
                    <div className="px-4 py-3">
                        <div className="space-y-1">
                            {footerItems.map((item) => renderNavItem(item))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


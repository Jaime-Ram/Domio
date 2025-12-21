import type { ElementType } from "react";

export interface NavItemType {
    label: string;
    href: string;
    icon: ElementType | (() => React.ReactNode);
    items?: NavItemType[];
    badge?: number | React.ReactNode;
    onClick?: () => void;
    description?: string;
}

export interface NavItemDividerType {
    divider: true;
}

export interface NavItemSectionHeaderType {
    sectionHeader: true;
    label: string;
}


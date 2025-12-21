import * as React from "react";
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatar-utils";

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    userId?: string | null;
    userName?: string | null;
    profilePicture?: string | null;
}

const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
};

export function Avatar({ 
    src, 
    alt, 
    size = "md", 
    className,
    userId,
    userName,
    profilePicture
}: AvatarProps) {
    // Use Untitled UI avatar as fallback
    const avatarUrl = getAvatarUrl(src, profilePicture, userId, userName);
    
    return (
        <UIAvatar className={cn(sizeClasses[size], className)}>
            <AvatarImage src={avatarUrl} alt={alt} />
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                {/* Show a simple placeholder while loading */}
            </AvatarFallback>
        </UIAvatar>
    );
}


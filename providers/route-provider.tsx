"use client";

import { useRouter } from "next/navigation";
import { RouterProvider as ReactAriaRouterProvider } from "react-aria-components";

export function RouteProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <ReactAriaRouterProvider 
            navigate={(path) => {
                router.push(path);
            }}
        >
            {children}
        </ReactAriaRouterProvider>
    );
}


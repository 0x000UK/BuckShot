"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordSiteVisit } from "@/app/actions/analytics.actions";

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        // Do not track admin backoffice routes
        if (!pathname || pathname.startsWith("/a/") || pathname.startsWith("/api/")) return;

        if (lastTrackedPath.current !== pathname) {
            lastTrackedPath.current = pathname;
            recordSiteVisit().catch(() => {});
        }
    }, [pathname]);

    return null;
}

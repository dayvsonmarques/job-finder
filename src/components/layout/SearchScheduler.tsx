"use client";

import { useEffect, useRef } from "react";
import { CHECK_INTERVAL_MS } from "@/lib/constants";

export function SearchScheduler() {
  const isSearching = useRef(false);

  useEffect(() => {
    const checkAndSearch = async () => {
      if (isSearching.current) return;

      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;

        const config = await res.json();
        if (!config?.isActive || !config.keywords) return;

        const intervalMs = config.intervalHours * 60 * 60 * 1000;
        const lastSearch = config.lastSearchAt
          ? new Date(config.lastSearchAt).getTime()
          : 0;

        if (Date.now() - lastSearch < intervalMs) return;

        isSearching.current = true;
        await fetch("/api/jobs/search", { method: "POST" });
        isSearching.current = false;
      } catch {
        isSearching.current = false;
      }
    };

    checkAndSearch();
    const timer = setInterval(checkAndSearch, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return null;
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { NAVIGATION_START } from "@/lib/navigation-progress";

/** Soft navigations that fail (RSC fetch error) never change pathname — clear stuck overlay. */
const OVERLAY_TIMEOUT_MS = 12_000;

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);

  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => setActive(false), []);

  useEffect(() => {
    stop();
  }, [pathname, searchParams, stop]);

  // Auto-clear if client navigation hangs (failed RSC payload, DB errors, etc.)
  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(stop, OVERLAY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [active, stop]);

  useEffect(() => {
    const onNavigationStart = () => start();
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const next = `${url.pathname}${url.search}`;
        const current = `${window.location.pathname}${window.location.search}`;
        if (next !== current) start();
      } catch {
        // ignore invalid href
      }
    };

    window.addEventListener(NAVIGATION_START, onNavigationStart);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener(NAVIGATION_START, onNavigationStart);
      document.removeEventListener("click", onClick, true);
    };
  }, [start]);

  if (!active) return null;

  return (
    <>
      <div className="navigation-progress-bar" aria-hidden />
      <div
        className="navigation-progress-overlay"
        role="status"
        aria-live="polite"
        aria-label="Loading page"
      >
        <div className="navigation-progress-spinner" />
        <p className="text-sm font-medium text-neutral-600">Loading...</p>
      </div>
    </>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}

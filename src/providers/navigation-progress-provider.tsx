"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationProgressState {
  pendingHref: string | null;
  startNavigation: (href: string) => void;
  clearNavigation: () => void;
}

const NavigationProgressContext = React.createContext<NavigationProgressState | undefined>(undefined);
const idleNavigationState: NavigationProgressState = {
  pendingHref: null,
  startNavigation: () => {},
  clearNavigation: () => {},
};

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function NavigationProgressInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const pendingHrefRef = React.useRef<string | null>(null);

  const clearNavigation = React.useCallback(() => {
    pendingHrefRef.current = null;
    setPendingHref(null);
  }, []);
  const startNavigation = React.useCallback((href: string) => {
    pendingHrefRef.current = href;
    setPendingHref(href);
  }, []);

  React.useEffect(() => {
    clearNavigation();
  }, [pathname, searchParams, clearNavigation]);

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return;
      const nextHref = `${url.pathname}${url.search}`;
      const currentHref = `${window.location.pathname}${window.location.search}`;
      if (nextHref === currentHref) return;
      if (pendingHrefRef.current === nextHref) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      pendingHrefRef.current = nextHref;
      setPendingHref(nextHref);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  const value = React.useMemo(
    () => ({ pendingHref, startNavigation, clearNavigation }),
    [pendingHref, startNavigation, clearNavigation],
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {pendingHref ? (
        <div className="fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent">
          <div 
            className="h-full w-2/3 rounded-r-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.8)]" 
            style={{ 
              animation: "slide-indeterminate 1.5s infinite ease-in-out", 
              transformOrigin: "left"
            }} 
          />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slide-indeterminate {
              0% { transform: translateX(-100%) scaleX(0.2); }
              50% { transform: translateX(0%) scaleX(1); }
              100% { transform: translateX(200%) scaleX(0.2); }
            }
          `}} />
        </div>
      ) : null}
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={
      <NavigationProgressContext.Provider value={idleNavigationState}>
        {children}
      </NavigationProgressContext.Provider>
    }>
      <NavigationProgressInner>{children}</NavigationProgressInner>
    </React.Suspense>
  );
}

export function useNavigationProgress() {
  const context = React.useContext(NavigationProgressContext);
  if (!context) {
    throw new Error("useNavigationProgress must be used within NavigationProgressProvider");
  }
  return context;
}

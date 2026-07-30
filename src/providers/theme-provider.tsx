"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateCurrentUserPreferences } from "@/features/users/api/user.api";
import {
  currentUserKeys,
  useCurrentUserQuery,
} from "@/features/users/hooks/use-current-user";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "clienthub.theme";

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

function readDocumentTheme(fallback: Theme): Theme {
  if (typeof document === "undefined") return fallback;
  const value = document.documentElement.getAttribute("data-theme");
  return isTheme(value) ? value : fallback;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    readDocumentTheme(defaultTheme),
  );
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authenticatedUserId = useAuthStore((state) => state.user?.id);
  const { data: currentUser } = useCurrentUserQuery({
    enabled: isAuthenticated,
  });
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncVersionRef = React.useRef(0);
  const pendingThemeRef = React.useRef<Theme | null>(null);

  const applyTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  React.useEffect(() => {
    if (
      !isAuthenticated ||
      !currentUser ||
      currentUser.id !== authenticatedUserId ||
      pendingThemeRef.current
    ) {
      return;
    }
    if (isTheme(currentUser.preferences.theme)) {
      applyTheme(currentUser.preferences.theme);
    }
  }, [
    applyTheme,
    authenticatedUserId,
    currentUser,
    isAuthenticated,
  ]);

  const persistTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (!isAuthenticated || !authenticatedUserId) return;

      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      pendingThemeRef.current = nextTheme;
      const version = ++syncVersionRef.current;

      syncTimerRef.current = setTimeout(async () => {
        try {
          const updatedUser = await updateCurrentUserPreferences({
            theme: nextTheme,
          });
          if (version !== syncVersionRef.current) return;
          queryClient.setQueryData(currentUserKeys.me(), updatedUser);
          pendingThemeRef.current = null;
        } catch {
          if (version !== syncVersionRef.current) return;
          pendingThemeRef.current = null;
          toast.warning(
            "Theme applied on this device, but could not sync to your account.",
          );
        }
      }, 250);
    },
    [authenticatedUserId, isAuthenticated, queryClient],
  );

  React.useEffect(
    () => () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    },
    [],
  );

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (!isTheme(nextTheme)) return;
      applyTheme(nextTheme);
      persistTheme(nextTheme);
    },
    [applyTheme, persistTheme],
  );

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

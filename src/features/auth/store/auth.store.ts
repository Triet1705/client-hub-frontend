import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPayload, JwtResponse } from "../types/auth.types";
import { setAuthCookies, getRefreshToken } from "@/lib/cookies";

interface AuthState {
  user: UserPayload | null;
  originalUser: UserPayload | null;
  isAuthenticated: boolean;
  impersonationToken: string | null;
  originalAdminToken: string | null;
  isImpersonating: boolean;
  setAuth: (data: JwtResponse) => void;
  clearAuth: () => void;
  setImpersonation: (impersonationToken: string, adminToken: string, userPayload: UserPayload) => void;
  exitImpersonation: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      originalUser: null,
      isAuthenticated: false,

      impersonationToken: null,
      originalAdminToken: null,
      isImpersonating: false,

      setAuth: (response: JwtResponse) => {
        set({
          user: {
            id: response.id,
            email: response.email,
            role: response.role,
            tenantId: response.tenant_id,
          },
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          originalUser: null,
          isAuthenticated: false,
          impersonationToken: null,
          originalAdminToken: null,
          isImpersonating: false,
        });
      },

      setImpersonation: (impersonationToken: string, adminToken: string, userPayload: UserPayload) => {
        if (!userPayload.tenantId) {
          throw new Error("Impersonation response is missing tenant ID.");
        }

        // Also save original refresh token so we can fully restore
        const currentRefresh = getRefreshToken() || "";

        // Write the impersonated token to cookies so middleware accepts it
        setAuthCookies(impersonationToken, currentRefresh, userPayload.tenantId);

        set((state) => ({
          impersonationToken,
          originalAdminToken: adminToken,
          isImpersonating: true,
          originalUser: state.user,
          user: userPayload,
          // Stash these in state too (we'll need to add to interface but let's just use localstorage or just keep refresh token as is since it's an admin refresh token)
        }));
      },

      exitImpersonation: () => {
        set((state) => {
          if (state.originalAdminToken && state.originalUser) {
            if (!state.originalUser.tenantId) {
              throw new Error("Original admin session is missing tenant ID.");
            }
            setAuthCookies(state.originalAdminToken, getRefreshToken() || "", state.originalUser.tenantId);
          }
          return {
            impersonationToken: null,
            originalAdminToken: null,
            isImpersonating: false,
            user: state.originalUser,
            originalUser: null,
          };
        });
      },
    }),
    {
      name: "client-hub-auth",
    },
  ),
);

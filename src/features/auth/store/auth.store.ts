import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPayload, JwtResponse } from "../types/auth.types";

interface AuthState {
  user: UserPayload | null;
  isAuthenticated: boolean;
  setAuth: (data: JwtResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

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
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "client-hub-auth",
    },
  ),
);

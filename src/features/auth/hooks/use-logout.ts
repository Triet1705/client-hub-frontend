import { useRouter } from "next/navigation";
import { logout as logoutApi } from "../api/auth.api";
import { clearAuthCookies, getRefreshToken } from "@/lib/cookies";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import { useDisconnect } from "wagmi";

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { disconnect } = useDisconnect();

  const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
      await logoutApi(refreshToken);
    } catch (error) {
      console.error("Failed to revoke token on server", error);
    }

    disconnect();
    clearAuthCookies();
    clearAuth();

    toast.info("Session Terminated", {
      description: "You have been logged out securely.",
    });
    router.push("/login");
  };

  return { logout };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  updateCurrentUserPreferences,
  updateCurrentUserProfile,
  type ChangePasswordPayload,
  type UpdateUserPreferencesPayload,
  type UpdateUserProfilePayload,
} from "../api/user.api";

export const currentUserKeys = {
  all: ["current-user"] as const,
  me: () => [...currentUserKeys.all, "me"] as const,
};

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: currentUserKeys.me(),
    queryFn: getCurrentUser,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserProfilePayload) => updateCurrentUserProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(currentUserKeys.me(), data);
      toast.success("Profile updated");
    },
  });
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPreferencesPayload) => updateCurrentUserPreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(currentUserKeys.me(), data);
      toast.success("Preferences saved");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changeCurrentUserPassword(payload),
    onSuccess: () => toast.success("Password updated"),
  });
}

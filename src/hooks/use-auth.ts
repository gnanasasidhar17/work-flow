"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { account } from "@/lib/appwrite";
import { useAuthStore } from "@/stores/auth-store";
import { ID, OAuthProvider } from "appwrite";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCurrentUser() {
  const { setUser, setLoading } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const user = await account.get();
        setUser({ $id: user.$id, name: user.name, email: user.email });
        return user;
      } catch {
        setUser(null);
        return null;
      }
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      try {
        await account.deleteSession("current");
      } catch {
        // Ignore if no active session
      }
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      return user;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser({ $id: user.$id, name: user.name, email: user.email });
      queryClient.setQueryData(["currentUser"], user);
      toast.success("Welcome back!");
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast.error(error?.message || "Login failed");
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      try {
        await account.deleteSession("current");
      } catch {
        // Ignore if no active session
      }
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      return user;
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser({ $id: user.$id, name: user.name, email: user.email });
      queryClient.setQueryData(["currentUser"], user);
      toast.success("Account created!");
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast.error(error?.message || "Signup failed");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await account.deleteSession("current");
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: () => {
      logout();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

export function useGoogleOAuth() {
  return useMutation({
    mutationFn: async () => {
      try {
        await account.deleteSession("current");
      } catch {
        // Ignore
      }
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/login`
      );
    },
  });
}

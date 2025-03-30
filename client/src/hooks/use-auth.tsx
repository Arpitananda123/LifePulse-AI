import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signOut as firebaseSignOut } from "@/lib/firebase";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  googleLoginMutation: UseMutationResult<SelectUser, Error, void>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Check if user is logged in
  const {
    data: user,
    error,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/me");
        if (res.status === 401) {
          return null;
        }
        return await res.json();
      } catch (err) {
        // If there's a network error or another problem, return null
        console.error("Error checking auth status:", err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    // Once the initial user check is complete, set loading to false
    if (!isLoadingUser) {
      setIsLoadingInitial(false);
    }
  }, [isLoadingUser]);

  // Traditional login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/me"], userData);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registration
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/me"], userData);
      toast({
        title: "Registration successful",
        description: `Welcome to LifePulse, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Google login
  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      try {
        // Step 1: Get token from Firebase
        const { idToken } = await signInWithGoogle();
        
        // Step 2: Verify with our server
        const res = await apiRequest("POST", "/api/login/google", { token: idToken });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Google login failed");
        }
        
        return await res.json();
      } catch (err) {
        console.error("Google login error:", err);
        throw new Error(err instanceof Error ? err.message : "Google login failed");
      }
    },
    onSuccess: (userData: SelectUser) => {
      queryClient.setQueryData(["/api/me"], userData);
      toast({
        title: "Login successful",
        description: `Welcome, ${userData.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Sign out from Firebase
      await firebaseSignOut();
      
      // Sign out from our server
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingInitial || isLoadingUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        googleLoginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
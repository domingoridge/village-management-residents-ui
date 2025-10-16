"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";

/**
 * Hook for managing authentication state and actions
 * Syncs Supabase auth with Zustand store
 */
export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  const authStore = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        authStore.setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          authStore.setUser(user);
          await fetchUserData(user.id);
        } else {
          authStore.reset();
        }
      } catch (error) {
        authStore.setError(
          error instanceof Error ? error.message : "Failed to initialize auth",
        );
      } finally {
        authStore.setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        authStore.setUser(session.user);
        await fetchUserData(session.user.id);
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        authStore.reset();
        router.push("/auth/login");
      } else if (event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetch user profile, tenant user, and resident data
   */
  const fetchUserData = async (authUserId: string) => {
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        authStore.setUserProfile({
          id: profile.id,
          authUserId: profile.auth_user_id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          preferences: profile.preferences as Record<string, unknown>,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        });

        // Fetch tenant user
        const { data: tenantUser, error: tenantError } = await supabase
          .from("tenant_user")
          .select("*")
          .eq("user_profile_id", profile.id)
          .eq("is_active", true)
          .single();

        if (tenantError) throw tenantError;

        if (tenantUser) {
          authStore.setTenantUser({
            id: tenantUser.id,
            userProfileId: tenantUser.user_profile_id,
            tenantId: tenantUser.tenant_id,
            roleId: tenantUser.role_id,
            permissions: tenantUser.permissions as Record<string, unknown>,
            isActive: tenantUser.is_active,
            joinedAt: tenantUser.joined_at,
            createdAt: tenantUser.created_at,
            updatedAt: tenantUser.updated_at,
          });

          // Fetch resident data
          const { data: resident, error: residentError } = await supabase
            .from("resident")
            .select("*")
            .eq("tenant_user_id", tenantUser.id)
            .single();

          if (!residentError && resident) {
            authStore.setResident({
              id: resident.id,
              tenantUserId: resident.tenant_user_id,
              householdId: resident.household_id,
              isPrimaryContact: resident.is_primary_contact,
              hasSignatoryRights: resident.has_signatory_rights,
              hasVisitingRights: resident.has_visiting_rights,
              idType: resident.id_type,
              idUrl: resident.id_url,
              createdAt: resident.created_at,
              updatedAt: resident.updated_at,
            });
          }
        }
      }
    } catch (error) {
      authStore.setError(
        error instanceof Error ? error.message : "Failed to fetch user data",
      );
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      addToast({
        type: "success",
        message: "Successfully signed in",
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      authStore.setError(message);
      addToast({
        type: "error",
        message,
      });
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      addToast({
        type: "success",
        message:
          "Successfully signed up. Please check your email to verify your account.",
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign up";
      authStore.setError(message);
      addToast({
        type: "error",
        message,
      });
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      authStore.setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      addToast({
        type: "success",
        message: "Successfully signed out",
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign out";
      authStore.setError(message);
      addToast({
        type: "error",
        message,
      });
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string) => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      addToast({
        type: "success",
        message: "Password reset email sent. Please check your inbox.",
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset email";
      authStore.setError(message);
      addToast({
        type: "error",
        message,
      });
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Update password
   */
  const updatePassword = async (newPassword: string) => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      addToast({
        type: "success",
        message: "Password updated successfully",
      });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update password";
      authStore.setError(message);
      addToast({
        type: "error",
        message,
      });
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  };

  return {
    // State
    user: authStore.user,
    userProfile: authStore.userProfile,
    tenantUser: authStore.tenantUser,
    resident: authStore.resident,
    isLoading: authStore.isLoading,
    error: authStore.error,
    isAuthenticated: authStore.isAuthenticated(),
    hasSignatoryRights: authStore.hasSignatoryRights(),
    hasVisitingRights: authStore.hasVisitingRights(),
    fullName: authStore.fullName(),

    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
}

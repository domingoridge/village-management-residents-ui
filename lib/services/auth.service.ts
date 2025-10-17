import type { SupabaseClient } from "@supabase/supabase-js";

export interface TenantInfo {
  tenant_id: string;
  tenant_name: string;
  tenant_status: string;
  role_id: string;
  role_code: string;
  role_name: string;
  is_active: boolean;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    app_metadata: Record<string, unknown>;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  };
  tenants: TenantInfo[];
  activeTenant: {
    tenant_id: string;
    role_code: string;
  } | null;
  requiresTenantSelection: boolean;
}

export interface AuthService {
  login(email: string, password: string): Promise<LoginResult>;
  switchTenant(tenantId: string): Promise<void>;
  getTenants(): Promise<TenantInfo[]>;
  getCurrentTenantId(): Promise<string | null>;
  getCurrentRoleId(): Promise<string | null>;
  logout(): Promise<void>;
}

export function createAuthService(supabase: SupabaseClient): AuthService {
  return {
    async login(email: string, password: string): Promise<LoginResult> {
      // Step 1: Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error("No session or user returned from login");
      }

      // Step 2: Fetch user's accessible tenants
      const tenants = await this.getTenants();

      if (tenants.length === 0) {
        // User has no tenants
        return {
          user: {
            id: data.user.id,
            email: data.user.email || "",
            app_metadata: data.user.app_metadata,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          },
          tenants: [],
          activeTenant: null,
          requiresTenantSelection: false,
        };
      }

      if (tenants.length === 1) {
        // Single tenant user - auto switch
        await this.switchTenant(tenants[0].tenant_id);

        // Refresh session to get updated JWT with tenant context
        const { data: refreshData } = await supabase.auth.refreshSession();
        const newSession = refreshData.session;

        return {
          user: {
            id: data.user.id,
            email: data.user.email || "",
            app_metadata: data.user.app_metadata,
          },
          session: {
            access_token: newSession?.access_token || data.session.access_token,
            refresh_token:
              newSession?.refresh_token || data.session.refresh_token,
            expires_at: newSession?.expires_at || data.session.expires_at,
          },
          tenants,
          activeTenant: {
            tenant_id: tenants[0].tenant_id,
            role_code: tenants[0].role_code,
          },
          requiresTenantSelection: false,
        };
      }

      // Multiple tenants - require selection
      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          app_metadata: data.user.app_metadata,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
        tenants,
        activeTenant: null,
        requiresTenantSelection: true,
      };
    },

    async switchTenant(tenantId: string): Promise<void> {
      // Call the RPC function to switch tenant context
      const { error } = await supabase.rpc("switch_tenant_context", {
        p_tenant_id: tenantId,
      });

      if (error) {
        throw new Error(`Failed to switch tenant: ${error.message}`);
      }

      // Force a session refresh to get the new JWT with updated claims
      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        throw new Error(`Failed to refresh session: ${refreshError.message}`);
      }
    },

    async getTenants(): Promise<TenantInfo[]> {
      const { data, error } = await supabase.rpc("get_user_tenants");

      if (error) {
        throw new Error(`Failed to fetch tenants: ${error.message}`);
      }

      return data || [];
    },

    async getCurrentTenantId(): Promise<string | null> {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      // Extract tenant_id from JWT custom claims
      const customClaims = session.user.app_metadata;
      return (customClaims.tenant_id as string) || null;
    },

    async getCurrentRoleId(): Promise<string | null> {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return null;
      }

      // Extract role_id from JWT custom claims
      const customClaims = session.user.app_metadata;
      return (customClaims.role_id as string) || null;
    },

    async logout(): Promise<void> {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
    },
  };
}

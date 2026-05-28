import { useState } from "react";
import { useAuth as useOidcAuth } from "react-oidc-context";

export interface AuthUser {
  email?: string;
  name?: string;
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  profile?: any;
}

export function useAuth() {
  const auth = useOidcAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const login = async () => {
    setIsRedirecting(true);
    try {
      await auth.signinRedirect({
        extraQueryParams: {
          prompt: "login",
        },
      });
    } catch (err) {
      console.error("Cognito signin redirect failed:", err);
      setIsRedirecting(false);
    }
  };

  const logout = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "122oq6m7ogsqkpmfq4nchlr7s0";
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI || "http://localhost:5173";
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

    // Clear local user tokens/session in react-oidc-context
    auth.removeUser();

    // If a custom domain is configured, perform full Cognito logout redirect
    if (cognitoDomain && !cognitoDomain.includes("your-user-pool-domain") && !cognitoDomain.includes("<user pool domain>")) {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } else {
      // Fallback: redirect locally to home
      window.location.href = logoutUri;
    }
  };

  const user: AuthUser | null = auth.user
    ? {
        email: auth.user.profile.email,
        name: auth.user.profile.name || auth.user.profile.email?.split("@")[0],
        idToken: auth.user.id_token,
        accessToken: auth.user.access_token,
        refreshToken: auth.user.refresh_token,
        profile: auth.user.profile,
      }
    : null;

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    isRedirecting,
    error: auth.error,
    user,
    login,
    logout,
  };
}

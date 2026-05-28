import { AuthProviderProps } from "react-oidc-context";

const authority = import.meta.env.VITE_COGNITO_AUTHORITY || "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_YwxjbnkPD";
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN || "https://us-east-1ywxjbnkpd.auth.us-east-1.amazoncognito.com";

export const cognitoAuthConfig: AuthProviderProps = {
  authority,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || "122oq6m7ogsqkpmfq4nchlr7s0",
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI || "http://localhost:5173",
  response_type: "code",
  scope: "phone openid email",
  onSigninCallback: (): void => {
    // Clean up code query parameters from the URL after a successful sign-in
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  metadata: {
    issuer: authority,
    authorization_endpoint: `${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `${cognitoDomain}/oauth2/userInfo`,
    jwks_uri: `${authority}/.well-known/jwks.json`,
    end_session_endpoint: `${cognitoDomain}/logout`,
  },
};

import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { cognitoAuthConfig } from "./app/config/authConfig";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
);
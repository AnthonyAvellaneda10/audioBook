/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_CONVERT_URL: string;
  readonly VITE_API_STATUS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

/**
 * Typed contract for the environment variables this app reads at build time.
 * Declaring them here keeps `import.meta.env` free of implicit `any`.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

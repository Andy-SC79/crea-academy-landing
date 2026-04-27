/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SITE_URL?: string;
  readonly VITE_I365_WIDGET_URL?: string;
  readonly VITE_I365_PAYMENT_APP_ID?: string;
  readonly VITE_I365_BOOTCAMP_PLAN_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}
declare module "*.mp3" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}

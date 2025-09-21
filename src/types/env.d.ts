// Augment NodeJS ProcessEnv for TypeScript intellisense

declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    MONGODB_DB_NAME?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    SITE_URL?: string;
    NEXT_PUBLIC_ANALYTICS_ID?: string;
  }
}

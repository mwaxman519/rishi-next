declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY: string;
    GOOGLE_API_KEY: string;
    DATABASE_URL: string;
    PGHOST: string;
    PGUSER: string;
    PGPASSWORD: string;
    PGDATABASE: string;
    PGPORT: string;
  }
}

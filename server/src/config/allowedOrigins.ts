const corsOriginsEnv = process.env.CORS_ORIGINS;

if (!corsOriginsEnv) {
  throw new Error("CORS_ORIGINS environment variable is not set.");
}

let allowedOrigins: string[];

try {
  // Explicitly parse the JSON string
  allowedOrigins = JSON.parse(corsOriginsEnv);
} catch (error) {
  throw new Error(`CORS_ORIGINS is not valid JSON: ${corsOriginsEnv}`);
}

export { allowedOrigins };

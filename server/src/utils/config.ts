import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Ensures that a required environment variable is set.
 * Throws an error if the variable is missing.
 * @param key The name of the environment variable.
 * @returns The value of the environment variable.
 */
// --------------- ENV VARIABLES --------------------
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};

export const getEnvVarAsNumber = (
  key: string,
  defaultValue?: number
): number => {
  const value = getEnvVar(
    key,
    defaultValue !== undefined ? defaultValue.toString() : undefined
  );
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number.`);
  }
  return parsed;
};

// Export specific environment variables
export const REFRESH_TOKEN_SECRET = getEnvVar("REFRESH_TOKEN_SECRET", "");
export const ACCESS_TOKEN_SECRET = getEnvVar("ACCESS_TOKEN_SECRET", "");
export const ACCESS_TOKEN_EXPIRES = getEnvVar("ACCESS_TOKEN_EXPIRES", "15m"); // e.g., '15m'
export const REFRESH_TOKEN_EXPIRES = getEnvVar("REFRESH_TOKEN_EXPIRES", "7d"); // e.g., '7d'
export const MAX_TOKENS = getEnvVarAsNumber("MAX_TOKENS", 5); // e.g., 5

export const MAX_UPLOAD_FILES = getEnvVarAsNumber("MAX_UPLOAD_FILES", 10);
export const ALLOWED_FILE_TYPES = getEnvVar(
  "ALLOWED_FILE_TYPES",
  "jpg,jpeg,png,pdf"
);
export const MAX_FILE_SIZE = getEnvVarAsNumber("MAX_FILE_SIZE", 5242880);
export const ENCRYPTION_KEY = getEnvVar(
  "ENCRYPTION_KEY",
  "your_32_byte_hex_key"
);
export const IV_LENGTH = getEnvVarAsNumber("IV_LENGTH", 16);

export const NODE_ENV = getEnvVar("NODE_ENV"); // development | staging | production
export const DOMAIN = getEnvVar("DOMAIN", "localhost");
export const API_BASE_URL = getEnvVar("API_BASE_URL", "http://localhost:3001");
export const FRONTEND_BASE_URL = getEnvVar(
  "FRONTEND_BASE_URL",
  "http://localhost:3000"
);

// --------------- ENV VARIABLES --------------------

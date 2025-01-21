import dotenv from "dotenv";
import path from "path";

export type Environment = "production" | "staging" | "development";

const nodeEnv: Environment =
  (process.env.NODE_ENV as Environment) || "development";

// Map correct .env files
const environments: Record<Environment, string> = {
  production: path.resolve(__dirname, "../../.env.production"),
  staging: path.resolve(__dirname, "../../.env.staging"),
  development: path.resolve(__dirname, "../../.env.development"),
};

// Load the correct .env file
const envFile = environments[nodeEnv];

const result = dotenv.config({ path: envFile });

if (result.error) {
  console.error(`Error loading environment file: ${envFile}`, result.error);
  process.exit(1);
}

export { nodeEnv as currentEnv, result as dotenvResult };

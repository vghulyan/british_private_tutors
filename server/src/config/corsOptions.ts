import { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins";

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    // Handle requests with no origin (e.g., mobile apps, Postman) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      // console.log("CORS ORIGINSIN *** ERROR");
      // callback(new Error("Not allowed by CORS")); // Block the request
      const error = new Error("Not allowed by CORS");
      // Attach a custom error code to distinguish CORS errors
      (error as any).isCorsError = true;
      callback(error);
    }
  },
  // origin: "*",
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;

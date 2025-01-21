import { SeverityLevel } from "@prisma/client";
import prisma from "./prisma";

/*
import { logError, SeverityLevel } from "@/utils/errorLogger";

export const exampleController = async (req: AuthRequest, res: Response) => {
  try {
    // Controller logic
    const data = await prisma.example.findMany();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Controller Error:", error);

    // Log the error using utility
    await logError({
      errorCode: "EXAMPLE_CONTROLLER_ERROR",
      message: error.message || "An unknown error occurred",
      stackTrace: error.stack || "",
      userId: req.user?.id || null,
      severity: SeverityLevel.ERROR,
    });

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
*/

export function extractErrorDetails(error: unknown): {
  message: string;
  stackTrace: string;
} {
  if (error instanceof Error) {
    return { message: error.message, stackTrace: error.stack || "" };
  }
  return { message: "An unknown error occurred", stackTrace: "" };
}

interface LogErrorParams {
  errorCode: string;
  message: string;
  stackTrace?: string;
  userId?: string | null;
  severity?: SeverityLevel;
}

export const logError = async ({
  errorCode,
  message,
  stackTrace,
  userId = null,
  severity = SeverityLevel.ERROR,
}: LogErrorParams): Promise<void> => {
  try {
    await prisma.errorLog.create({
      data: {
        errorCode,
        message,
        stackTrace: stackTrace || "",
        userId,
        severity,
      },
    });
  } catch (loggingError) {
    console.error("Error logging to database:", loggingError);
    // You might want to log this to an external service like Sentry here.
  }
};

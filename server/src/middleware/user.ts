import { Request, Response, NextFunction } from "express";
import { sendResponse, STATUS } from "../interfaces";

// Middleware to check if userId is present in the request params
export const checkUserId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.params.userId;

  // Check if userId is provided
  if (!userId) {
    sendResponse(
      res,
      400,
      STATUS.ERROR,
      "User ID is required to retrieve dashboard metrics"
    );
    return;
  }

  // Proceed to the next middleware or controller if userId exists
  next();
};

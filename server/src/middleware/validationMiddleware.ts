import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    console.log("Errors in validate request: ", errors);
  }
  if (!errors.isEmpty()) {
    console.log("errors>>> ", errors);
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

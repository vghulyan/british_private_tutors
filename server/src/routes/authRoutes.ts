import express, { Request, Response, NextFunction, Router } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { check, body, validationResult, checkSchema } from "express-validator";
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPasswordController,
} from "../controllers/authController";

import { csrfProtection } from "../middleware/csrfMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { AuditAction, UserRole } from "@prisma/client";
import { logRequestWithEntityId } from "../utils/logAuditAction";
import { createRateLimiter } from "../middleware/loginLimiter";

const router: Router = express.Router();

// LOGIN
// const validateLogin = [
//   body("userName")
//     .trim()
//     .escape()
//     .notEmpty()
//     .isEmail()
//     .normalizeEmail({ gmail_remove_dots: false })
//     .withMessage("Email is required."),
//   body("password")
//     .trim()
//     .escape()
//     .notEmpty()
//     .withMessage("Password is required"),
// ];
const loginLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    message:
      "Too many requests from this IP, please try again after 2 minutes.",
  },
});
export const validateLogin = checkSchema({
  userName: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Email is required.",
    },
    isEmail: {
      errorMessage: "Invalid email format.",
    },
    normalizeEmail: {
      options: { gmail_remove_dots: false }, // Keep dots in Gmail addresses
    },
    trim: true,
    escape: true,
  },
  password: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Password is required.",
    },
    isString: {
      errorMessage: "Password must be a string.",
    },
    trim: true,
    escape: true,
  },
});
router.post(
  "/login",
  csrfProtection,
  loginLimiter,
  validateLogin,
  validateRequest,
  login
);

// REGISTRATION
export const registrationValidationSchema = checkSchema({
  role: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isIn: {
      options: [["EMPLOYER", "EMPLOYEE"]],
      errorMessage: "Role must be 'EMPLOYER' or 'EMPLOYEE'.",
    },
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "Please provide a valid email address.",
    },
    normalizeEmail: true,
  },
  password: {
    in: ["body"],
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters long.",
    },
  },
  "generalInfo.title": {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["Mr", "Ms"]],
      errorMessage: "Title must be 'Mr' or 'Ms'.",
    },
  },
  "generalInfo.firstName": {
    in: ["body"],
    notEmpty: {
      errorMessage: "First name is required.",
    },
    isString: {
      errorMessage: "First name must be a string.",
    },
    trim: true,
  },
  "generalInfo.lastName": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Last name is required.",
    },
    isString: {
      errorMessage: "Last name must be a string.",
    },
    trim: true,
  },
  "generalInfo.address1": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Address line 1 is required.",
    },
    isString: {
      errorMessage: "Address line 1 must be a string.",
    },
    trim: true,
  },
  "generalInfo.address2": {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Address line 2 must be a string.",
    },
    trim: true,
  },
  "generalInfo.region": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Region is required.",
    },
    isString: {
      errorMessage: "Region must be a string.",
    },
    trim: true,
  },
  "generalInfo.city": {
    in: ["body"],
    notEmpty: {
      errorMessage: "City is required.",
    },
    isString: {
      errorMessage: "City must be a string.",
    },
    trim: true,
  },
  "generalInfo.zipCode": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Zip code is required.",
    },
    isPostalCode: {
      options: "any", // Use locale-specific codes if needed, e.g., 'US', 'GB'
      errorMessage: "Zip code must be valid.",
    },
  },
  "generalInfo.country": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Country is required.",
    },
    isString: {
      errorMessage: "Country must be a string.",
    },
    trim: true,
  },
  "generalInfo.mobile": {
    in: ["body"],
    notEmpty: {
      errorMessage: "Mobile is required.",
    },
    isMobilePhone: {
      options: "any", // Use locale-specific rules if needed, e.g., 'en-US'
      errorMessage: "Mobile must be a valid phone number.",
    },
  },
});
router.post(
  "/register",
  csrfProtection,
  registrationValidationSchema,
  validateRequest,
  register
);

// Refresh Token Route
router.post("/refresh", csrfProtection, refresh);

router.post(
  "/logout",
  logRequestWithEntityId(AuditAction.LOGOUT, "Logout"),
  logout
);

// FORGOT PASSWORD
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message:
      "Too many password reset requests from this IP, please try again later.",
  },
});
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

export const validateResetPassword = [
  // newPassword must be at least 8 chars (example)
  body("newPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
  // confirmPassword optional if you want to match
  body("confirmPassword")
    .optional()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("token").notEmpty().withMessage("Reset token is required."),
];
router.post(
  "/reset-password",
  validateResetPassword,
  validateRequest,
  resetPasswordController
);

export default router;

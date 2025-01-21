import express, { Router } from "express";
import { body, param, query } from "express-validator";
import {
  adminRegisterNewUser,
  createEmailTemplate,
  deleteQrCode,
  generateQrCode,
  getAdminProfile,
  getAllQrCodes,
  getAllUsers,
  getEmailTemplates,
  getEmployeeById,
  getErrorLogs,
  softDeleteUser,
  trackScan,
  updateEmailTemplate,
} from "../controllers/adminController";
import { checkUserExists } from "../middleware/checkUserExists";

import { SeverityLevel, UserRole } from "@prisma/client";
import { validateRequest } from "../middleware/validationMiddleware";
import { authorizeRoles } from "../utils/authorizeRoles";

const router: Router = express.Router();

router.get(
  "/get-admin-profile",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  getAdminProfile
);

export const getEmployeeByIdValidator = [
  param("id")
    .exists()
    .withMessage("Employee ID is required.")
    // .isUUID()
    .isString()
    .withMessage("Employee ID must be a valid UUID."),
];
router.get(
  "/get-employee-by-id/:id",
  getEmployeeByIdValidator,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  getEmployeeById
);

router.get(
  "/get-all-users",
  authorizeRoles(UserRole.ADMIN),
  validateRequest,
  getAllUsers
);

export const softDeleteUserByIdValidator = [
  param("id") // Match the route parameter name
    .exists()
    .withMessage("User ID is required.")
    .isUUID()
    .withMessage("User ID must be a valid UUID."),
];
router.delete(
  "/soft-delete-user/:id", // Ensure `id` matches the parameter in the validator
  softDeleteUserByIdValidator, // Validator middleware
  validateRequest, // Middleware to check validation errors
  authorizeRoles(UserRole.ADMIN), // Middleware for role-based access control
  softDeleteUser
);

export const registerAdminNewUserValidator = [
  // Email validation
  body("email").isEmail().withMessage("A valid email is required."),

  // Password validation
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one numeric digit."),

  // First name validation
  body("firstName")
    .notEmpty()
    .withMessage("First name is required.")
    .isString()
    .withMessage("First name must be a string."),

  // Last name validation
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required.")
    .isString()
    .withMessage("Last name must be a string."),

  // Title validation (optional)
  body("title").optional().isString().withMessage("Title must be a string."),

  // Role validation
  body("role")
    .exists()
    .withMessage("Role is required.")
    .isIn(["MODERATOR"]) // Update allowed roles based on your use case
    .withMessage("User role must be MODERATOR."),
];
router.post(
  "/admin-register-new-user",
  registerAdminNewUserValidator,
  authorizeRoles(UserRole.ADMIN),
  adminRegisterNewUser
);

export const validateErrorLogsQuery = [
  query("severity")
    .optional()
    .isIn(Object.values(SeverityLevel))
    .withMessage("Severity must be one of INFO, WARNING, ERROR, or CRITICAL"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO8601 date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO8601 date"),
];
router.get(
  "/settings/get-error-logs",
  validateErrorLogsQuery,
  authorizeRoles(UserRole.ADMIN),
  getErrorLogs
);

// --------- EMAIL TEMPLATES
export const emailTemplateValidation = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("subject").trim().notEmpty().withMessage("Subject is required."),
  body("htmlContent")
    .trim()
    .notEmpty()
    .withMessage("HTML content is required."),
  body("textContent").optional().isString(),
];
router.post(
  "/create-email-template",
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  emailTemplateValidation,
  createEmailTemplate
);
router.put(
  "/update-email-template/:id",
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  emailTemplateValidation,
  updateEmailTemplate
);

router.get(
  "/get-email-templates",
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  getEmailTemplates
);

// -------------- QR CODES -------------
// ------------------ QR CODE ----------------------
const validateQrCode = [
  body("url").isURL().withMessage("Valid URL is required"),
  body("name").notEmpty().withMessage("Name is required"),
];
// Routes
router.post(
  "/qrcode/generate-qr-code",
  validateQrCode,
  authorizeRoles(UserRole.ADMIN),
  generateQrCode
);
router.get(
  "/qrcode/get-all-qr-codes",
  authorizeRoles(UserRole.ADMIN),
  getAllQrCodes
);
router.delete(
  "/qrcode/delete-qr-code/:id",
  authorizeRoles(UserRole.ADMIN),
  deleteQrCode
);

router.get("/qrcode/track-scan/:id", trackScan);

export default router;

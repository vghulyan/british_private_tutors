import { NotificationStatus, UserRole } from "@prisma/client";
import express, { Router } from "express";
import { body, param } from "express-validator";
import {
  deleteAccount,
  deleteAvatarController,
  generateBackupCodesHandler,
  getAvatarController,
  getNotifications,
  getUserPreferences,
  getUserProfile,
  resendVerification,
  reset2FA,
  revokeBackupCodesHandler,
  setup2FA,
  updateProfile,
  updateStatus,
  updateUser,
  updateUserPassword,
  updateUserPreferences,
  uploadAvatarController,
  verify2FA,
  verifyBackupCodeHandler,
} from "../controllers/userController";
import { checkUserExists } from "../middleware/checkUserExists";
import { createRateLimiter } from "../middleware/loginLimiter";
import { upload } from "../middleware/uploadMiddleware";
import { validateFileUpload } from "../middleware/validateFileUpload";
import { validateRequest } from "../middleware/validationMiddleware";
import { authorizeRoles } from "../utils/authorizeRoles";

const router: Router = express.Router();

// =========== USER PROFILE =================
router.get(
  "/user-profile/get-user-profile",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  getUserProfile
);

const validateProfileUpdate = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ max: 50 }),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ max: 50 }),
  body("notes").optional().trim().isLength({ max: 500 }),

  body("addresses").isArray().withMessage("Addresses must be an array."),

  // For each address:
  body("addresses.*.address1")
    .trim()
    .notEmpty()
    .withMessage("Address1 is required.")
    .isLength({ max: 100 }),
  body("addresses.*.address2")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }),
  body("addresses.*.city")
    .trim()
    .notEmpty()
    .withMessage("City is required.")
    .isLength({ max: 50 }),
  body("addresses.*.region")
    .trim()
    .notEmpty()
    .withMessage("Region is required.")
    .isLength({ max: 100 }),
  body("addresses.*.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip code is required.")
    .matches(/^[A-Za-z0-9\s\-]{3,10}$/),
  body("addresses.*.countryId")
    .notEmpty()
    .withMessage("Country ID is required.")
    .isUUID()
    .withMessage("Country ID must be a valid UUID."),

  // If address id is provided, must be UUID, else it's new address
  body("addresses.*.id")
    .optional()
    .isUUID()
    .withMessage("Address ID must be a valid UUID if provided."),
];
router.put(
  "/update-profile",
  validateProfileUpdate,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  updateProfile
);
// =================== NOTIFICATIONS =====================
router.get(
  "/notifications/get-notifications",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  getNotifications
);

export const updateNotificationStatusValidation = [
  param("notificationId")
    .isUUID()
    .withMessage("Invalid notification ID format."),
  body("notificationStatus")
    .isIn(Object.values(NotificationStatus))
    .withMessage("Status must be either 'READ' or 'DISMISSED'."),
  validateRequest,
];
router.put(
  "/notifications/update-status/:notificationId",
  updateNotificationStatusValidation,
  // validateRequest,
  // checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  updateStatus
);

// User Settings
router.get("/preferences/get-user-preferences", getUserPreferences);
router.post("/preferences/update-user-preferences", updateUserPreferences);

export const userPasswordValidation = [
  body("password")
    .isString()
    .withMessage("Invalid password format.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
router.post("/user-profile/update-user-password", updateUserPassword);

export const userUpdateValidation = [
  body("firstName")
    .isString()
    .isLength({ max: 100 })
    .withMessage("First name must be a string and max 100 characters."),
  body("lastName")
    .isString()
    .isLength({ max: 100 })
    .withMessage("Last name must be a string and max 100 characters."),
  body("title")
    .isString()
    .isLength({ max: 10 })
    .withMessage("Title must be a string and max 10 characters."),
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage("Notes must be a string and max 300 characters."),
];
router.post("/user-profile/update-user-info", userUpdateValidation, updateUser);

// -------------------- AVATAR -----------------------
const uploadAvatarLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 2, // Limit each IP to 2 upload requests per windowMs
  message: {
    message:
      "Too many upload requests from this IP, please try again after 2 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
router.post(
  "/upload-avatar",
  uploadAvatarLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  upload.single("avatar"),
  validateFileUpload("avatar"),
  uploadAvatarController
);
router.get(
  "/get-avatar",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  getAvatarController
);
router.delete(
  "/delete-avatar",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  deleteAvatarController
);

// --------------- 2FA ------------
const twoFactorLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: {
    message: "Too many attempts, please try again after 5 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
router.post(
  "/user-profile/2fa/setup",
  twoFactorLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  setup2FA
);
export const twoFATokenValidator = [
  body("token")
    .exists({ checkFalsy: true })
    .withMessage("Token is required.")
    .isNumeric()
    .withMessage("Token must be a numeric value.")
    .isLength({ min: 6, max: 6 })
    .withMessage("Token must be exactly 6 digits."),
];
router.post(
  "/user-profile/2fa/verify",
  twoFactorLimiter,
  twoFATokenValidator,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  verify2FA
);
router.post(
  "/user-profile/2fa/reset",
  twoFactorLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  reset2FA
);

// ---------------------- BACKUP CODES -----------
const backupCodeLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    message: "Too many attempts, please try again after 5 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
router.post(
  "/user-profile/backup/generate-backup",
  backupCodeLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  generateBackupCodesHandler
);

// Route to verify backup code (during login or account recovery)
router.post(
  "/user-profile/backup/verify-backup",
  backupCodeLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  verifyBackupCodeHandler
);

// Route to revoke and regenerate backup codes
router.post(
  "/user-profile/backup/revoke-backup",
  backupCodeLimiter,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN),
  revokeBackupCodesHandler
);

//
router.post(
  "/user-profile/backup/resend-verification",
  // authorizeRoles(UserRole.EMPLOYEE, UserRole.EMPLOYER, UserRole.ADMIN),
  resendVerification
);

// ---------------- DELETE ACCOUNT ----------------
router.delete(
  "/delete-account",
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.ADMIN),
  deleteAccount
);

export default router;

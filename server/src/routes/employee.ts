import express, { Router } from "express";
import { body, checkSchema } from "express-validator";
import {
  createEmployee,
  editProfile,
  getEmployeeProfile,
  removeEmployee,
  searchEmployees,
} from "../controllers/employeeController";
import { checkUserExists } from "../middleware/checkUserExists";

import { AuditAction, EmployeeStatus, Gender, UserRole } from "@prisma/client";
import { validateRequest } from "../middleware/validationMiddleware";
import { authorizeRoles } from "../utils/authorizeRoles";
import { logRequestWithEntityId } from "../utils/logAuditAction";

const router: Router = express.Router();

// GET EMPLOYEES PROFILE
router.get(
  "/get-employee-profile",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  getEmployeeProfile
);

// CREATE
export const createProfileValidator = [
  body("dob")
    .notEmpty()
    .isISO8601()
    .toDate()
    .withMessage("Date of birth must be a valid date."),
  body("gender")
    .notEmpty()
    .isIn(Object.values(Gender))
    .withMessage("Gender must be one of the following: MALE, FEMALE, OTHER."),
  body("status")
    .optional()
    .isIn(Object.values(EmployeeStatus))
    .withMessage(
      "Status must be one of the following: AVAILABLE, UNAVAILABLE, ON_LEAVE."
    ),
  body("notes").optional().isString().withMessage("Notes must be a string."),
];
router.post(
  "/create-employee",
  createProfileValidator,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  logRequestWithEntityId(AuditAction.CREATE, "Create Employee"),
  createEmployee
);

// EDIT
export const editProfileValidator = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string."),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string."),
  body("dob")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Date of birth must be a valid date."),
  body("gender")
    .optional()
    .isIn(Object.values(Gender))
    .withMessage("Gender must be one of the following: MALE, FEMALE, OTHER."),
  body("status")
    .optional()
    .isIn(Object.values(EmployeeStatus))
    .withMessage(
      "Status must be one of the following: AVAILABLE, UNAVAILABLE, ON_LEAVE."
    ),
  body("notes").optional().isString().withMessage("Notes must be a string."),
];
router.put(
  "/",
  editProfileValidator,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  logRequestWithEntityId(AuditAction.UPDATE, "Edit Employee Profile"),
  editProfile
);

// DELETE
router.delete(
  "/",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  logRequestWithEntityId(AuditAction.DELETE, "Employee Delete"),
  removeEmployee
);

// ToDo: Use this signature in all express validations
// SEARCH EMPLOYEES - FILTER
const searchEmployeeValidation = checkSchema({
  firstName: {
    optional: true,
    isString: true,
    trim: true,
  },
  lastName: {
    optional: true,
    isString: true,
    trim: true,
  },
  gender: {
    optional: true,
    isIn: {
      options: [["MALE", "FEMALE", "OTHER"]],
      errorMessage: "Invalid gender value",
    },
  },
  status: {
    optional: true,
    isIn: {
      options: [["AVAILABLE", "UNAVAILABLE", "ON_LEAVE"]],
      errorMessage: "Invalid status value",
    },
  },
});
router.get(
  "/search",
  searchEmployeeValidation,
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  searchEmployees
);

export default router;

import express, { Router } from "express";
import { checkUserExists } from "../middleware/checkUserExists";

import { UserRole } from "@prisma/client";
import { validateRequest } from "../middleware/validationMiddleware";
import { authorizeRoles } from "../utils/authorizeRoles";
import {
  getAllUsersModerator,
  getModeratorProfile,
} from "../controllers/moderatorController";

const router: Router = express.Router();

router.get(
  "/get-moderator-profile",
  validateRequest,
  checkUserExists,
  authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR),
  getModeratorProfile
);

router.get(
  "/get-all-users-moderator",
  authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR),
  validateRequest,
  getAllUsersModerator
);

export default router;

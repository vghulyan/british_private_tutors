import express, { Router } from "express";

import { verifyEmail } from "../controllers/publicServiceController";

const router: Router = express.Router();

// ----------------- VERIFY EMAIL ----------------
router.get("/verify-email", verifyEmail);

export default router;

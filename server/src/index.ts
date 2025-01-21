import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

import { currentEnv, dotenvResult } from "./config/envConfig";

console.log("------------------------------------------------------");
console.log(`Environment: ${currentEnv}`);
if (dotenvResult.error) {
  console.error("Failed to load environment variables.");
  process.exit(1); // Exit if environment variables failed to load
}
console.log("------------------------------------------------------");

import corsOptions from "./config/corsOptions";
import prisma from "./utils/prisma";

import db from "./db";

import helmetOption from "./config/helmetOption";

/**
 * ROUTES
 */
import rootRouter from "./routes/root";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import employeeRoutes from "./routes/employee";
import moderatorRoutes from "./routes/moderatorRoutes";
import publicServices from "./routes/publicServices";

import { csrfProtection } from "./middleware/csrfMiddleware";

import { UserRole } from "@prisma/client";
import { checkUserExists } from "./middleware/checkUserExists";
import { validateRequest } from "./middleware/validationMiddleware";
import { verifyJWT } from "./middleware/verifyJWT";
import { authorizeRoles } from "./utils/authorizeRoles";
import { sendResponse, STATUS } from "./interfaces";

/* CONFIGURATIONS */

const app = express();

app.use(helmetOption());
app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// -------------- CSRF -------------
app.get("/api/csrf-token", csrfProtection, (req: Request, res: Response) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

// ToDo: Enable in Production
// HTTPS Encryption -------------------------------------------------------
const enforceSSL = (req: Request, res: Response, next: NextFunction) => {
  if (req.secure) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
};

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(enforceSSL);
} else if (process.env.NODE_ENV === "staging") {
  app.set("trust proxy", 1);
  // Uncomment if you want to enforce SSL in staging as well:
  app.use(enforceSSL);
} else {
  // development
  app.set("trust proxy", false);
}

// HTTPS Encryption -------------------------------------------------------

/* ROUTES */
app.use("/api", /*loginLimiter,*/ rootRouter); // http://localhost:3000/api

app.use(
  "/api/admin",
  validateRequest,
  verifyJWT,
  checkUserExists,
  authorizeRoles(UserRole.ADMIN),
  adminRoutes
);

app.use(
  "/api/moderator",
  validateRequest,
  verifyJWT,
  checkUserExists,
  authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR),
  moderatorRoutes
);

// LOGIN, LOGOUT, REFRESH
app.use("/api/auth", authRoutes); // http://localhost:3000/api/auth

// EMPLOYEE
app.use(
  "/api/employees",
  validateRequest,
  verifyJWT,
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE),
  employeeRoutes
); // http://localhost:3000/api/employee

app.use(
  "/api/user",
  validateRequest,
  verifyJWT, // 1
  checkUserExists,
  authorizeRoles(UserRole.EMPLOYEE, UserRole.MODERATOR, UserRole.ADMIN), // 2
  userRoutes
);

app.use("/api/public-services", publicServices);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(((
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): express.Response | void => {
  const csrfTokenFromHeader = req.headers["X-CSRF-Token"];
  const csrfTokenFromCookie = req.cookies?.csrfToken;

  // console.log("Err in app use: ", err);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    console.error("Blocked CORS request from origin:", req.headers.origin);
    return res.status(403).json({
      error: {
        message: "CORS not allowed: Origin is not permitted.",
        origin: req.headers.origin || "Unknown origin",
      },
    });
  }

  // Handle CSRF token errors
  if (err.code === "EBADCSRFTOKEN") {
    console.log("FORM TAMPERED ", err);
    return res.status(403).json({ message: "Form tampered with." });
  }

  // Pass other errors to the next handler
  next(err);
}) as express.ErrorRequestHandler);

// ---------- SOCKET -----------

// ============= END SOCKET ==============

const PORT = Number(process.env.PORT) || 4001;
const DOMAIN = process.env.DOMAIN;

/* SERVER */
const startServer = async () => {
  try {
    await db.connect();
    console.log("Connected to the PostgreSQL database - ", new Date());

    app.listen(PORT, "0.0.0.0", async () => {
      console.log(`Server is running at ${DOMAIN}:${PORT} -- `, new Date());

      // ******** CRON JOBS ***********
    });
  } catch (err) {
    const error = err as Error & {
      code?: string;
      errno?: number;
      syscall?: string;
      address?: string;
      port?: number;
    };

    const errorMessage = `
      Error Name: ${error.name}
      Error Message: ${error.message}
      Error Code: ${error.code ?? "N/A"}
      Errno: ${error.errno ?? "N/A"}
      Syscall: ${error.syscall ?? "N/A"}
      Address: ${error.address ?? "N/A"}
      Port: ${error.port ?? "N/A"}
      Stack: ${error.stack}
    `;

    console.error("Failed to connect to the database:", errorMessage);

    process.exit(1); // Exit the process with failure
  }
};

// Start the server after establishing a database connection
startServer();

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing server");
  await prisma.$disconnect(); // Close the Prisma connection
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing server");
  await prisma.$disconnect();
  process.exit(0);
});

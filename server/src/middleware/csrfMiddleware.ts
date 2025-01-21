// middlewares/csrfMiddleware.ts
import csrf from "csurf";

// Define and export csrfProtection
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true, // Accessible only by the web server
    secure: process.env.NODE_ENV === "production", // ToDo: enable in LIVE - LIVE: process.env.NODE_ENV === "production", // HTTPS in production
    sameSite: "strict", // Protects against CSRF
    // You can add 'path' and 'domain' if needed
  },
});

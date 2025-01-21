import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export function sanitizeInput(value: any): string {
  if (typeof value !== "string") return value;
  // Basic sanitization: trim and remove any suspicious characters.
  // You can add a library like DOMPurify or sanitize-html if needed.
  return purify.sanitize(value.trim());
}

export function sanitizeAll(values: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const key in values) {
    const val = values[key];
    if (typeof val === "string") {
      sanitized[key] = sanitizeInput(val);
    } else if (val && typeof val === "object") {
      sanitized[key] = sanitizeAll(val); // Recursively sanitize nested objects
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

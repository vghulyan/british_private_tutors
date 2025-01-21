import { ApiResponse } from "./apiResponse";

export interface Email {
  fromEmail: string;
  recipientEmail: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
}
export interface EmailByTemplateUpdate {
  fromEmail: string;
  recipientEmail: string;
  templateName: string;
  placeholders: Record<string, string>;
}

// ------- email template
export interface EmailTemplate {
  id: string;
  name: string; // e.g., "verification_email"
  subject: string; // Subject line of the email
  htmlContent: string; // HTML content of the email
  textContent?: string; // Optional plain text content
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
}

export type EmailResponses = ApiResponse<{
  emails: Email[];
}>;

export type EmailTemplatesResponse = ApiResponse<{
  templates: EmailTemplate[];
}>;
export type EmailTemplateResponse = ApiResponse<{
  template: EmailTemplate;
}>;

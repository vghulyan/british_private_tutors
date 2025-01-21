import prisma from "../../utils/prisma";
import { sendEmail } from "./emailService";

function replacePlaceholders(
  template: string,
  placeholders: Record<string, string>
) {
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

interface SendEmailByTemplateLogicParams {
  from: string;
  recipientEmail: string;
  templateName: string;
  placeholders?: Record<string, string>;
}

/**
 * Utility to send an email by template name outside of a request/response context.
 * @param from - Email of the sender
 * @param recipientEmail - Email of the recipient
 * @param templateName - Name of the template
 * @param placeholders - Key-value pairs to replace in the template
 */
export async function sendEmailByTemplateLogic({
  from,
  recipientEmail,
  templateName,
  placeholders = {},
}: SendEmailByTemplateLogicParams): Promise<void> {
  const template = await prisma.emailTemplate.findUnique({
    where: { name: templateName },
  });

  if (!template) {
    throw new Error(`Template "${templateName}" not found.`);
  }

  let { subject, htmlContent, textContent } = template;

  subject = replacePlaceholders(subject, placeholders);
  htmlContent = replacePlaceholders(htmlContent, placeholders);
  if (textContent) {
    textContent = replacePlaceholders(textContent, placeholders);
  }

  const result = await sendEmail({
    from,
    to: recipientEmail,
    subject,
    text: textContent ?? undefined,
    html: htmlContent,
  });
  return result;
}

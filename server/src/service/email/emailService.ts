import nodemailer from "nodemailer";

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NO_REPLY_EMAIL_USER, // no_reply@gingernanny.com
    pass: process.env.NO_REPLY_EMAIL_PASS, // App Password from Zoho
  },
});

/**
 * Send an email using the configured transporter.
 * @param {SendEmailParams} params - The email details.
 * @returns {Promise<void>}
 */
export const sendEmail = async ({
  from,
  to,
  subject,
  text,
  html,
}: SendEmailParams): Promise<void> => {
  try {
    const response = await transporter.sendMail({
      from: `${process.env.PROJECT_NAME}" <${from}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

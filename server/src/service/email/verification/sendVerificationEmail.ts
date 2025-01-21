import { generateJWTToken } from "../../../controllers/authController";
import { sendEmailByTemplateLogic } from "../sendEmailByTemplateLogic";
import { API_BASE_URL } from "../../../utils/config";

interface SendVerificationEmailParams {
  userId: string;
  email: string;
  firstName: string;
  templateName?: string; // Defaults to "verification_email"
  projectName?: string; // Defaults to "Ginger Nanny"
}

export const sendVerificationEmail = async ({
  userId,
  email,
  firstName,
  templateName = "verification_email",
  projectName = process.env.PROJECT_NAME || "Project",
}: SendVerificationEmailParams): Promise<void> => {
  try {
    // Generate the verification token
    const token = generateJWTToken(userId);

    // Construct the verification link
    const verificationLink = `${API_BASE_URL}/api/public-services/verify-email?token=${encodeURIComponent(
      token
    )}`;

    // Send the email using the provided template
    await sendEmailByTemplateLogic({
      from: process.env.NO_REPLY_EMAIL_USER!,
      recipientEmail: email,
      templateName,
      placeholders: {
        name: firstName,
        verificationLink,
        "Your Company": projectName,
      },
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    throw new Error("Failed to send verification email.");
  }
};

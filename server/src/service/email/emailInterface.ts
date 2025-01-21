import { sendEmail } from "./emailService";

export interface EmailService {
  sendEmail: typeof sendEmail;
}

const emailService: EmailService = {
  sendEmail,
};

export default emailService;

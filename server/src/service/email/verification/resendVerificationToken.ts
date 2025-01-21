import prisma from "../../../utils/prisma";
import { sendVerificationEmail } from "./sendVerificationEmail";

export const resendVerificationToken = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isEmailVerified) {
    throw new Error("Email is already verified.");
  }

  await sendVerificationEmail({
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
  });

  return { message: "Verification email resent successfully." };
};

// src/utils/backupCodes.ts

import crypto from "crypto";
import bcrypt from "bcrypt";

// ToDo: Move to .env | DB
export const EXPECTED_TOTP_LENGTH = 6; // Typical length for TOTP tokens
export const EXPECTED_BACKUP_CODE_LENGTH = 20;
const BACKUP_CODE_LENGTH = 8; // Length of each backup code
const BACKUP_CODES_COUNT = 5; // Number of backup codes to generate
const SALT_ROUNDS = 10; // For bcrypt

export const generateSingleBackupCode = (): string => {
  // Generates a 20-character alphanumeric code
  return crypto.randomBytes(15).toString("hex").slice(0, 20).toUpperCase();
};

export const generateBackupCodes = (count: number = 5): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateSingleBackupCode());
  }
  return codes;
};

// Function to format backup codes for display (e.g., add spaces every 4 characters)
export const formatBackupCodeForDisplay = (code: string): string => {
  return code.replace(/(.{4})/g, "$1 ").trim();
};
// /**
//  * Generates a specified number of random backup codes.
//  * @returns An array of plain backup codes.
//  */
// export const generateBackupCodes = (): string[] => {
//   const backupCodes: string[] = [];
//   for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
//     const code = crypto
//       .randomBytes(BACKUP_CODE_LENGTH)
//       .toString("hex")
//       .slice(0, BACKUP_CODE_LENGTH)
//       .toUpperCase();
//     backupCodes.push(code);
//   }
//   return backupCodes;
// };

/**
 * Hashes a plain backup code using bcrypt.
 * @param code - The plain backup code.
 * @returns The hashed backup code.
 */
export const hashBackupCode = async (code: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(code, salt);
  return hash;
};

/**
 * Verifies a plain backup code against its hashed version.
 * @param code - The plain backup code entered by the user.
 * @param hash - The hashed backup code stored in the database.
 * @returns A boolean indicating whether the code is valid.
 */
export const verifyBackupCode = async (
  code: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(code, hash);
};

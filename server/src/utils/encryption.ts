// src/utils/encryption.ts

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc"; // Must match between encryption and decryption
const IV_LENGTH = 16; // 16 bytes for aes-256-cbc

const key = process.env.ENCRYPTION_KEY || "default_secret_keyz";
if (key.length < 32) {
  throw new Error(
    "ENCRYPTION_KEY must be at least 32 characters long for aes-256-cbc"
  );
}

const keyBuffer = crypto.scryptSync(key, "salt", 32); // 32 bytes key for aes-256-cbc

/**
 * Encrypts a plaintext string and returns a base64 encoded string.
 * @param text - The plaintext to encrypt.
 * @returns The base64 encoded encrypted string.
 */
export const encryptString = (text: string): string => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    // Prepend IV to the encrypted data
    const encryptedBuffer = Buffer.concat([iv, encrypted]);
    // Return as base64 encoded string
    return encryptedBuffer.toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data.");
  }
};

/**
 * Decrypts a base64 encoded encrypted string and returns the plaintext.
 * @param encryptedBase64 - The base64 encoded encrypted string.
 * @returns The decrypted plaintext string.
 */
export const decryptString = (encryptedBase64: string): string => {
  try {
    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
    if (encryptedBuffer.length < IV_LENGTH) {
      throw new Error("Invalid encrypted data. Data is too short.");
    }
    // Extract IV from the beginning of the encrypted data
    const iv = encryptedBuffer.subarray(0, IV_LENGTH);
    const encrypted = encryptedBuffer.subarray(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data.");
  }
};

// import crypto from "crypto";
// const ALGORITHM = "aes-256-cbc";

// import { ENCRYPTION_KEY, IV_LENGTH } from "./config";

// if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
//   throw new Error(
//     "ENCRYPTION_KEY must be set in .env and be 64 hex characters long."
//   );
// }
// // Convert the hex string to a Buffer
// const keyBuffer = Buffer.from(ENCRYPTION_KEY, "hex");

// // Encrypt a Buffer
export const encryptBuffer = (buffer: Buffer): Buffer => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  // Prepend IV to the encrypted data
  return Buffer.concat([iv, encrypted]);
};

// // Decrypt a Buffer
export const decryptBuffer = (encryptedBuffer: Buffer): Buffer => {
  // Extract IV from the beginning of the encrypted data
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const encrypted = encryptedBuffer.subarray(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted;
};

// // Encrypt a string and return base64 encoded string
// export const encryptString = (text: string): string => {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
//   const encrypted = Buffer.concat([
//     cipher.update(text, "utf8"),
//     cipher.final(),
//   ]);
//   // Prepend IV to the encrypted data
//   const encryptedBuffer = Buffer.concat([iv, encrypted]);
//   // Return as base64 encoded string
//   return encryptedBuffer.toString("base64");
// };

// // Decrypt a base64 encoded string
// export const decryptString = (encryptedBase64: string): string => {
//   const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
//   // Extract IV from the beginning of the encrypted data
//   const keyBuffer = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
//   console.log("\n\nkey buffer: ------>>>>> ", keyBuffer);
//   console.log("ENCRYPTION_KEY", ENCRYPTION_KEY);
//   console.log("IV_LENGTH", IV_LENGTH);
//   console.log("ALGORITHM", ALGORITHM);
//   const iv = encryptedBuffer.subarray(0, IV_LENGTH);
//   console.log("iv: ", iv);
//   const encrypted = encryptedBuffer.subarray(IV_LENGTH);
//   console.log("encrypted: ", encrypted);
//   const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
//   console.log("decipher: ", decipher);
//   const decrypted = Buffer.concat([
//     decipher.update(encrypted),
//     decipher.final(),
//   ]);
//   return decrypted.toString("utf8");
// };

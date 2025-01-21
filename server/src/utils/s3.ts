// src/utils/s3.ts

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Define environment variables with non-null assertions
const bucketName: string = process.env.AWS_BUCKET_NAME!;
const region: string = process.env.AWS_BUCKET_REGION!;
const accessKeyId: string = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY!;

// Initialize the S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Define TypeScript interfaces for upload functions
export interface UploadAvatarParams {
  fileBuffer: Buffer;
  mimetype: string;
  userId: string; // Unique identifier for the user
}

export interface UploadDocumentParams {
  fileBuffer: Buffer;
  mimetype: string;
  userId: string; // Optional: If you want to associate documents with users
}

export interface DeleteFileParams {
  fileName: string;
  folder?: string; // Specify folder if needed
}

export interface GetSignedUrlParams {
  key: string;
  expiresIn?: number; // Default to 60 seconds if not provided
}

export type UploadFunction = (
  fileBuffer: Buffer,
  mimetype: string
) => Promise<string>;

/**
 * Uploads a user's avatar to S3 with a unique file name.
 * @param params - Parameters including file buffer, MIME type, and user ID.
 * @returns The S3 key (file name) of the uploaded avatar.
 */
export const uploadAvatar = async ({
  fileBuffer,
  mimetype,
  userId,
}: UploadAvatarParams): Promise<string> => {
  // Determine file extension based on MIME type
  const extension = mimetype.split("/")[1]; // e.g., "jpeg", "png"

  // Generate a unique filename using the user ID
  const fileName = `${userId}/avatars/${userId}.${extension}`;

  const uploadParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
    //ACL: "public-read", // Optional: Set permissions as needed
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return fileName;
};

/**
 * Uploads an employee document to S3 with a crypto-generated file name.
 * @param params - Parameters including file buffer, MIME type, and user ID.
 * @returns The S3 key (file name) of the uploaded document.
 */
export const uploadDocument = async ({
  fileBuffer,
  mimetype,
  userId,
}: UploadDocumentParams): Promise<string> => {
  // Generate a random file name with 16 hexadecimal characters
  const randomName = crypto.randomBytes(8).toString("hex");

  // Determine file extension based on MIME type
  const extension = mimetype.split("/")[1]; // e.g., "pdf", "docx"

  // Optionally, associate documents with users by including userId
  const fileName = `${userId}/documents/${userId}/${randomName}.${extension}`;

  const uploadParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
    //ACL: "private", // Documents are typically private
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return fileName;
};

export const uploadSocialAccount = async ({
  fileBuffer,
  mimetype,
  userId,
}: UploadDocumentParams): Promise<string> => {
  // Generate a random file name with 16 hexadecimal characters
  const randomName = crypto.randomBytes(8).toString("hex");

  // Determine file extension based on MIME type
  const extension = mimetype.split("/")[1]; // e.g., "pdf", "docx"

  // Optionally, associate documents with users by including userId
  const fileName = `${userId}/social/${userId}/${randomName}.${extension}`;

  const uploadParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
    //ACL: "private", // Documents are typically private
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  return fileName;
};

/**
 * Deletes a file from S3.
 * @param params - Parameters including file name and optional folder.
 */
export const deleteFile = async ({
  fileName,
}: DeleteFileParams): Promise<void> => {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: bucketName,
    Key: fileName,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
};

/**
 * Generates a signed URL for accessing a file in S3.
 * @param params - Parameters including the S3 key and optional expiration time.
 * @returns The signed URL as a string.
 */
export const getObjectSignedUrl = async ({
  key,
  expiresIn = 3660,
}: GetSignedUrlParams): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
};

export function getExtensionFromMimetype(mimetype: string): string {
  const parts = mimetype.split("/");
  return parts[1] || "bin"; // default to .bin if unknown
}

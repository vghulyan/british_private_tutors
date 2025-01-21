import { ApiResponse } from "./apiResponse";
import { QrCodeScan } from "./QrCodeScan";

export interface QrCode {
  id: string; // UUID for the QR Code record
  name: string; // Name or title of the QR Code
  url: string; // The URL embedded in the QR Code
  qrCodeImage: string; // Base64-encoded string or file path of the QR Code image
  createdAt: Date; // Timestamp when the QR Code was created
  updatedAt: Date; // Timestamp when the QR Code was last updated
  scans: QrCodeScan[]; // List of scans associated with the QR Code
}
export type QrCodeResponse = ApiResponse<{
  qrcode: QrCode;
}>;
export type QrCodesResponse = ApiResponse<{
  qrcodes: QrCode[];
}>;

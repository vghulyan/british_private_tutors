import { ApiResponse } from "./apiResponse";

export interface QrCodeScan {
  id: string; // UUID for the scan record
  qrCodeId: string; // Foreign key linking to QrCode
  ipAddress?: string; // IP address of the scanner (optional)
  userAgent?: string; // User agent of the scanner (optional)
  scanTime: Date; // Timestamp of the scan
}
export type QrCodeScanResponse = ApiResponse<{
  qrcodeScan: QrCodeScan;
}>;
export type QrCodesScanResponse = ApiResponse<{
  qrcodeScans: QrCodeScan[];
}>;

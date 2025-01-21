export interface GenerateBackupCodesResponse {
  code: number;
  message: string;
  status: string;
  result: { backupCodes: string[] }; // Array of backup codes
}

export interface TwoFactorSetupResponse {
  result: {
    secret: string;
    qrCode: string;
  };
}

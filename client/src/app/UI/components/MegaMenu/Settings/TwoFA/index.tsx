// src/components/TwoFactorSetup.tsx

import { useProfile } from "@/hooks/useProfile";
import { User } from "@/state/dataTypes/interfaces";
import {
  useReset2FAMutation,
  useSetupTwoFactorMutation,
  useVerifyTwoFactorMutation,
} from "@/state/store/user/userApi";
import Image from "next/image";
import React, { useState } from "react";

// interface TwoFactorSetupProps {
//   user: User;
// }

// const TwoFactorSetup: React.FC<TwoFactorSetupProps> = () => {
const TwoFactorSetup = () => {
  const { profile, isSuccess, isError } = useProfile();

  const [setupTwoFactor, { data, isLoading: isSetupLoading }] =
    useSetupTwoFactorMutation();
  const [verifyTwoFactor, { isLoading: isVerifyLoading }] =
    useVerifyTwoFactorMutation();
  const [resetTwoFactor, { isLoading: isResetLoading }] = useReset2FAMutation();

  const [token, setToken] = useState<string>("");

  const handleSetup = async () => {
    await setupTwoFactor().unwrap();
  };

  const handleVerify = async () => {
    await verifyTwoFactor({ token }).unwrap();
  };
  const handleReset = async () => {
    await resetTwoFactor().unwrap();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">
          {profile?.user.twoFactorEnabled
            ? "You enabled 2FA"
            : "Enable Two-Factor Authentication"}
        </h2>
        {!profile?.user.twoFactorEnabled ? (
          !data ? (
            <button
              onClick={handleSetup}
              disabled={isSetupLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {isSetupLoading ? "Setting up..." : "Setup 2FA"}
            </button>
          ) : (
            <div className="mt-4">
              {/* <img src={data.result.qrCode} alt="2FA QR Code" /> */}
              <Image
                src={data.result.qrCode}
                alt="2FA QR Code"
                width={200} // specify an appropriate width
                height={200} // specify an appropriate height
                priority // optionally, if the image is critical for LCP
              />
              <p className="mt-2">
                Scan this QR code with your authenticator app.
              </p>
              <input
                type="text"
                placeholder="Enter the code from your app"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 p-2 border rounded w-full"
              />
              <button
                onClick={handleVerify}
                disabled={isVerifyLoading || !token}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                {isVerifyLoading ? "Verifying..." : "Verify and Enable 2FA"}
              </button>
            </div>
          )
        ) : (
          <button
            onClick={handleReset}
            disabled={isSetupLoading}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isSetupLoading ? "Reset 2FA..." : "Reset 2FA"}
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;

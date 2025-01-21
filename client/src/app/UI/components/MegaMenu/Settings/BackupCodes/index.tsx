"use client";

import React, { useState } from "react";

import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";

import { ClipboardIcon, DownloadIcon } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { User } from "@/state/dataTypes/interfaces";
import {
  useGenerateBackupCodesMutation,
  useRevokeBackupCodesMutation,
} from "@/state/store/user/userApi";

const BackupCodesManager = () => {
  const { profile, isSuccess, isError } = useProfile();
  const [generateBackupCodes, { isLoading: isGenerating }] =
    useGenerateBackupCodesMutation();
  const [revokeBackupCodes, { isLoading: isRevoking }] =
    useRevokeBackupCodesMutation();
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  /**
   * Handles the generation of backup codes.
   */
  const handleGenerate = async () => {
    const backupCodesResponse = await generateBackupCodes().unwrap();
    setBackupCodes(backupCodesResponse.result.backupCodes);
  };

  /**
   * Handles the revocation and regeneration of backup codes.
   */
  const handleRevoke = async () => {
    const response = await revokeBackupCodes().unwrap();
    setBackupCodes(response.result.backupCodes);
  };

  /**
   * Generates and downloads the backup codes as a text file.
   */
  const handleDownloadTxt = () => {
    if (!backupCodes) return;

    const blob = new Blob([backupCodes.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "backup-codes.txt");
    toast.success("Backup codes downloaded as text file.");
  };

  /**
   * Generates and downloads the backup codes as a PDF file.
   */
  const handleDownloadPDF = () => {
    if (!backupCodes) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Your Backup Codes", 20, 20);
    doc.setFontSize(12);
    backupCodes.forEach((code, index) => {
      doc.text(`${index + 1}. ${code}`, 20, 30 + index * 10);
    });
    doc.save("backup-codes.pdf");
    toast.success("Backup codes downloaded as PDF.");
  };

  /**
   * Copies a single backup code to the clipboard.
   */
  const handleCopy = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success("Backup code copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy backup code.");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-8">
      <div className="flex flex-col w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Backup Codes</h2>

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Backup codes are single-use codes that you can use to access your
            account if you lose access to your authenticator app.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Important:</strong> Each code can be used once. Please copy
            and store each backup code individually. Do not copy multiple codes
            at once. Store them securely in a password manager or another safe
            location.
          </p>
        </div>

        {/* Backup Codes Display */}
        {backupCodes ? (
          <div className="mb-6">
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              Here are your backup codes:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-center font-mono"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => handleCopy(code)}
                    className="ml-2 p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Copy this backup code"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-gray-500">
              <strong>Note:</strong> Please copy and store each backup code
              individually. Do not copy multiple codes at once.
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              You have not generated backup codes yet. Generating new backup
              codes will invalidate any existing ones.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {!backupCodes && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full sm:w-auto px-4 py-2 ${
                profile?.user.backupCodesEnabled
                  ? "bg-green-500"
                  : "bg-blue-500"
              } text-white rounded-md hover:bg-blue-600 disabled:opacity-50`}
            >
              {isGenerating
                ? "Generating..."
                : `Generate ${
                    profile?.user.backupCodesEnabled ? "again" : "Backup Codes"
                  }`}
            </button>
          )}

          {backupCodes && (
            <>
              <button
                onClick={handleDownloadTxt}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download TXT
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download PDF
              </button>
              <button
                onClick={handleRevoke}
                disabled={isRevoking}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {isRevoking ? "Revoking..." : "Revoke and Generate New Codes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupCodesManager;

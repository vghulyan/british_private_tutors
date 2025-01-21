"use client";

import React, { useState } from "react";
import DOMPurify from "dompurify";
import { useUpdatePasswordMutation } from "@/state/store/user/userApi";
import { useNavigateToDashboard } from "@/hooks/useNavigateToDashboard";

const UpdatePassword: React.FC = () => {
  const navigateToDashboard = useNavigateToDashboard();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [updatePassword] = useUpdatePasswordMutation();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sanitize input using DOMPurify
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setNewPassword(sanitizedInput);
    setError("");
  };

  const handleUpdateClick = () => {
    // Check for minimum length requirement
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    // Show confirmation prompt
    setConfirmUpdate(true);
  };

  const handleConfirmClick = async () => {
    await updatePassword({ newPassword });
    setNewPassword("");
    setConfirmUpdate(false);

    navigateToDashboard();
  };

  const handleCancelClick = () => {
    // Reset confirmation state
    setNewPassword("");
    setConfirmUpdate(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-6 rounded-lg w-full md:w-1/3">
        {!confirmUpdate ? (
          <>
            <label
              htmlFor="new-password"
              className="block mb-2 text-sm font-medium"
            >
              Enter your new password (min 6 characters):
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="New password"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <button
              onClick={handleUpdateClick}
              disabled={!newPassword}
              className={`mt-4 px-4 py-2 rounded-md text-white ${
                newPassword
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Update
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm">
              Are you sure you want to update your password?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleConfirmClick}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
              >
                Yes, Update
              </button>
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;

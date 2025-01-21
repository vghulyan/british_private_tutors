// components/LoginForm.tsx

"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/state/store/redux";

import { UserRole } from "@/state/dataTypes/enums";
import {
  useLoginMutation,
  useFetchCsrfTokenQuery,
} from "@/state/store/auth/authApi";
import {
  selectAuth,
  setCredentials,
  setCsrfToken,
} from "@/state/store/auth/authSlice"; // Ensure you have setAuth to store user info

import {
  selectedRequires2FA,
  setRequires2FA,
} from "@/state/store/user/userSlice";
import { toast } from "react-toastify"; // Assuming you're using react-toastify for notifications
import { useNavigateToDashboard } from "@/hooks/useNavigateToDashboard";

const LoginForm: React.FC = () => {
  const navigateToDashboard = useNavigateToDashboard();
  const requires2FA = useAppSelector(selectedRequires2FA);

  // Define a TypeScript interface for form data
  interface LoginFormData {
    userName: string;
    password: string;
    token: string; // 2FA token or backup code
  }

  // Initialize form data
  // Employee: employee1
  // Employer: employer1
  // Moderator: moderator1
  // Admin: admin
  // Password123!
  const [formData, setFormData] = useState<LoginFormData>({
    userName:
      process.env.NODE_ENV === "development" ? "employee1@example.com" : "",
    password: process.env.NODE_ENV === "development" ? "Password123!" : "",
    token: "",
  });

  // Fetch CSRF token
  const {
    data: csrfTokenData,
    isLoading: isCsrfLoading,
    error: csrfError,
  } = useFetchCsrfTokenQuery();

  const [login, { isLoading, isError }] = useLoginMutation();
  const isAuthenticatedUser = useAppSelector(selectAuth);

  const dispatch = useAppDispatch();
  const router = useRouter();

  // General error message
  const [errorMessage, setErrorMessage] = useState("");

  // Specific token error message
  const [tokenErrorMessage, setTokenErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticatedUser && isAuthenticatedUser.isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticatedUser, router]);

  // Helper functions for validation
  const isNumeric = (str: string) => /^\d+$/.test(str);
  const isAlphanumeric = (str: string) => /^[A-Z0-9]+$/.test(str);

  // Handle input changes with validation for the token field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "token") {
      // Allow spaces and convert to uppercase
      const rawValue = value.toUpperCase();
      const strippedValue = rawValue.replace(/\s+/g, "");

      // Define expected lengths
      const EXPECTED_TOTP_LENGTH = 6;
      const EXPECTED_BACKUP_CODE_LENGTH = 20;

      // Determine input type based on current input
      if (strippedValue.length > EXPECTED_BACKUP_CODE_LENGTH) {
        setTokenErrorMessage(
          `Backup code cannot exceed ${EXPECTED_BACKUP_CODE_LENGTH} characters.`
        );
        // Prevent updating the token if it exceeds the limit
        return;
      } else {
        setTokenErrorMessage("");
      }

      // Additional validations
      if (strippedValue.length > 0) {
        if (isNumeric(strippedValue)) {
          // Likely a TOTP token
          if (strippedValue.length !== EXPECTED_TOTP_LENGTH) {
            setTokenErrorMessage(
              `2FA token must be exactly ${EXPECTED_TOTP_LENGTH} digits.`
            );
          } else {
            setTokenErrorMessage("");
          }
        } else {
          // Likely a backup code
          if (strippedValue.length !== EXPECTED_BACKUP_CODE_LENGTH) {
            setTokenErrorMessage(
              `Backup code must be exactly ${EXPECTED_BACKUP_CODE_LENGTH} characters.`
            );
          } else if (!isAlphanumeric(strippedValue)) {
            setTokenErrorMessage(
              `Backup code must contain only uppercase letters and numbers.`
            );
          } else {
            setTokenErrorMessage("");
          }
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "token" ? value.toUpperCase() : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure CSRF token is available
    if (!csrfTokenData) {
      setErrorMessage("CSRF token not available. Please try again.");
      return;
    }

    try {
      // Perform the login mutation
      const csrfToken = csrfTokenData?.csrfToken;
      dispatch(setCsrfToken(csrfToken));

      // Perform the login mutation
      const response = await login({
        userCredentials: formData,
        csrfToken,
      }).unwrap();

      // Check if login was successful
      if (response.result.accessToken) {
        setErrorMessage("");
        dispatch(
          setCredentials({
            isAuthenticated: true,
            accessToken: response.result.accessToken,
            role: response.result.role as UserRole,
            userId: response.result.userId,
            csrfToken: response.result.csrfToken,
            isEmailVerified: response.result.isEmailVerified,
          })
        );
        // Redirect to dashboard
        router.push("/dashboard");
        navigateToDashboard();
      } else if (response.result.requires2FA) {
        // Clear any existing error messages
        setErrorMessage("");
      }
    } catch (err: any) {
      console.error("Failed to login:", err);

      if (err.status === 206 && err.data.requires2FA) {
        // Set 2FA requirement in Redux state
        dispatch(setRequires2FA(true));
        // Clear any existing error messages
        setErrorMessage("");
      } else if (err.status === 401) {
        console.log("\n\n\nLOGIN FORM 401... ", err);
        setErrorMessage(err.data.message || "Invalid email or password.");
      } else if (err.status === "FETCH_ERROR") {
        console.log("FETCH ERROR vg: ***** ", err);
        setErrorMessage("Server under maintenance, please come back later.");
      } else {
        console.log("unexpectred error occured.... ", err);
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  // Handle 2FA submission
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure CSRF token is available
    if (!csrfTokenData) {
      setErrorMessage("CSRF token not available. Please try again.");
      return;
    }

    // Normalize the token: remove spaces and convert to uppercase
    const strippedToken = formData.token.replace(/\s+/g, "").toUpperCase();

    // **Validate the token length**
    const EXPECTED_TOTP_LENGTH = 6; // Typical length for TOTP tokens
    const EXPECTED_BACKUP_CODE_LENGTH = 20; // As per your backup code generation

    // Additional validations based on token type
    if (isNumeric(strippedToken)) {
      // TOTP Token Validation
      if (strippedToken.length !== EXPECTED_TOTP_LENGTH) {
        setErrorMessage(
          `2FA token must be exactly ${EXPECTED_TOTP_LENGTH} digits.`
        );
        return;
      }
    } else {
      // Backup Code Validation
      if (strippedToken.length !== EXPECTED_BACKUP_CODE_LENGTH) {
        setErrorMessage(
          `Backup code must be exactly ${EXPECTED_BACKUP_CODE_LENGTH} characters.`
        );
        return;
      }
      if (!isAlphanumeric(strippedToken)) {
        setErrorMessage(
          `Backup code must contain only uppercase letters and numbers.`
        );
        return;
      }
    }

    try {
      const csrfToken = csrfTokenData?.csrfToken;
      dispatch(setCsrfToken(csrfToken));

      const response = await login({
        userCredentials: formData,
        csrfToken,
      }).unwrap();

      // Check if login was successful
      if (response.result.accessToken) {
        setErrorMessage("");
        dispatch(
          setCredentials({
            isAuthenticated: true,
            accessToken: response.result.accessToken,
            role: response.result.role as UserRole,
            userId: response.result.userId,
            csrfToken: response.result.csrfToken,
            isEmailVerified: response.result.isEmailVerified,
          })
        );
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Failed to verify 2FA:", err);

      if (err.status === 401) {
        setErrorMessage(
          err.data.message || "Invalid 2FA token or backup code."
        );
      } else if (err.status === "FETCH_ERROR") {
        setErrorMessage("Server under maintenance, please come back later.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-6 sm:py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-6 sm:mt-10 text-center text-xl sm:text-2xl font-bold leading-8 sm:leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Display general error message if any */}
        {errorMessage && !requires2FA && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {errorMessage}</span>
          </div>
        )}

        {/* Optionally, display a message if CSRF token failed to load */}
        {csrfError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Warning: </strong>
            <span className="block sm:inline">Please refresh the page.</span>
          </div>
        )}

        {/* Combined Login and 2FA Form */}
        <form
          onSubmit={requires2FA ? handle2FASubmit : handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="userName"
                name="userName"
                type="email"
                value={formData.userName}
                onChange={handleChange}
                required
                autoComplete="email"
                className={`block w-full rounded-md border-0 p-2 text-gray-900 dark:text-gray-100 shadow-sm bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6 ${
                  requires2FA ? "bg-gray-100" : ""
                }`}
                disabled={requires2FA} // Optionally disable during 2FA to prevent changes
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={`block w-full rounded-md border-0 p-2 text-gray-900 dark:text-gray-100 shadow-sm bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6 ${
                  requires2FA ? "bg-gray-100" : ""
                }`}
                disabled={requires2FA} // Optionally disable during 2FA to prevent changes
              />
            </div>
          </div>

          {/* Conditionally Render 2FA Token Field */}
          {requires2FA && (
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Two-Factor Authentication Token or Backup Code
              </label>
              <div className="mt-2">
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={formData.token}
                  onChange={handleChange}
                  required
                  placeholder="Enter your 2FA token (6 digits) or backup code (20 characters)"
                  maxLength={25} // Allow some extra characters for spaces
                  className={`block w-full rounded-md border-0 p-2 text-gray-900 dark:text-gray-100 shadow-sm bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6 ${
                    tokenErrorMessage ? "ring-red-500" : ""
                  }`}
                  onPaste={(e) => {
                    const pasteData = e.clipboardData.getData("text");
                    const strippedPasteData = pasteData
                      .replace(/\s+/g, "")
                      .toUpperCase();
                    if (strippedPasteData.length > 20) {
                      e.preventDefault();
                      setTokenErrorMessage(
                        `Pasted backup code cannot exceed 20 characters.`
                      );
                      toast.error("Pasted backup code exceeds 20 characters.");
                    }
                  }}
                />
                {/* Display token-specific error message */}
                {tokenErrorMessage && (
                  <p
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                    aria-live="assertive"
                  >
                    {tokenErrorMessage}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter your 2FA token (6 digits) or a backup code (20
                  characters).
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            {/* <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="ml-2 text-gray-700">Remember Me</span>
            </label> */}
            <div className="text-sm">
              <a
                href="#"
                onClick={() => router.push("/auth/forgot-password")}
                className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                requires2FA
                  ? "bg-green-600 hover:bg-green-500 focus-visible:outline-green-600"
                  : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"
              }`}
              disabled={
                isLoading ||
                isCsrfLoading ||
                !csrfTokenData ||
                (requires2FA && !!tokenErrorMessage)
              }
            >
              {isLoading
                ? requires2FA
                  ? "Verifying..."
                  : "Logging in..."
                : requires2FA
                ? "Verify and Login"
                : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-gray-500">
          Don’t have an account?{" "}
          <a
            href="/auth/register"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

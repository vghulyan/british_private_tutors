// const errMsg = extractErrorMessage(error);
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "error" in error) {
    const errObj = (error as any).error; // Access the nested `error` object
    if (errObj && typeof errObj === "object" && "data" in errObj) {
      const { code, status, message, errors, ...rest } = errObj.data;
      console.log("Code:", code);
      console.log("Status:", status);
      console.log("Other details:", rest);

      if (errors && Array.isArray(errors)) {
        // If errors array is present, return a concatenated string of all messages
        return errors.map((e: { msg: string }) => e.msg).join("; ");
      }

      return message || "An unexpected error occurred.";
    }
    if (errObj && typeof errObj === "object") {
      // Check if it's a fetch error
      if (errObj.status === "FETCH_ERROR") {
        return "Failed to fetch the resource. Please check your connection, CORS or server.";
      }

      // Look for specific error messages
      if ("message" in errObj) {
        return errObj.message as string;
      }
    }
  }

  return "An unexpected error occurred.";
}

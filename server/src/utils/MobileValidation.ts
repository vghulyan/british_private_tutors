import { parsePhoneNumberFromString } from "libphonenumber-js";

/*
const phoneNumber = parsePhoneNumberFromString(fullNumber);
if (phoneNumber) {
  const countryCode = phoneNumber.countryCallingCode; // e.g., "44"
  const nationalNumber = phoneNumber.nationalNumber;   // e.g., "7123456789"
}
  */
export function isValidPhoneNumber(fullNumber: string): boolean {
  const phoneNumber = parsePhoneNumberFromString(fullNumber);
  return phoneNumber ? phoneNumber.isValid() : false;
}

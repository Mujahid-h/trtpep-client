import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function getPhoneDetails(number, countryISO) {
  // If number has +countryCode, ISO is not needed
  const phoneNumber = number.startsWith("+")
    ? parsePhoneNumberFromString(number)
    : parsePhoneNumberFromString(number, countryISO);

  if (!phoneNumber) {
    return { error: "Invalid phone number" };
  }

  return {
    countryCode: phoneNumber.countryCallingCode, // e.g. "92"
    countryISO: phoneNumber.country, // e.g. "PK"
    formatted: phoneNumber, // e.g. "+923001234567"
  };
}

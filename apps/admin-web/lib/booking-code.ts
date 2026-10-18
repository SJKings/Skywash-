import { randomInt } from "node:crypto";

// No 0/O/1/I/L so codes are easy to read aloud and type.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_PATTERN = /^SW-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;

export function generateBookingCode() {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `SW-${suffix}`;
}

/**
 * Normalizes user input ("sw 4fq2", "4FQ2", " SW-4fq2 ") to "SW-4FQ2".
 * Returns null when the result is not a well-formed code.
 */
export function normalizeBookingCode(input: string) {
  let code = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!code.startsWith("SW-")) {
    code = `SW-${code.replace(/^SW-?/, "")}`;
  }
  return CODE_PATTERN.test(code) ? code : null;
}

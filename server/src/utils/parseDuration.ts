// utils/parseDuration.ts

import ms from "ms";

/**
 * Parses a duration string into milliseconds.
 * @param duration - The duration string (e.g., "7d", "24h", "30m").
 * @returns The duration in milliseconds.
 * @throws Will throw an error if the duration format is invalid.
 */
export const parseDuration = (duration: string): number => {
  const parsed = ms(duration);
  if (typeof parsed !== "number") {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  return parsed;
};

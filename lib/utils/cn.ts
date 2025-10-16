import { clsx, type ClassValue } from "clsx";

/**
 * Utility for merging Tailwind CSS classes
 * Uses clsx for conditional class merging
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes intelligently.
 * This is used throughout the UI components for conditional class name application.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
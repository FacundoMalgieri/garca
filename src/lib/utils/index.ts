/**
 * Utility functions for GARCA.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge for optimal CSS class handling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency in Argentine Peso format.
 */
export function formatCurrencyARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

/**
 * Formats a number as currency in USD format.
 */
export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a date string to a localized format for Argentina.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Calculates the remaining margin for Monotributo category.
 */
export function calculateRemainingMargin(
  currentAmount: number,
  categoryLimit: number
): number {
  return Math.max(0, categoryLimit - currentAmount);
}

/**
 * Gets the percentage of limit used.
 */
export function calculateLimitPercentage(
  currentAmount: number,
  categoryLimit: number
): number {
  if (categoryLimit === 0) return 0;
  return Math.min(100, (currentAmount / categoryLimit) * 100);
}

/**
 * Validates if a file has the correct extension.
 */
export function validateFileExtension(
  file: File,
  allowedExtensions: string[]
): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Converts a file to base64 string for certificate processing.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:text/plain;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
  });
}

/**
 * Generates a unique ID for components.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

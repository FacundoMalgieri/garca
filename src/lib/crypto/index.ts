/**
 * Cryptographic utilities for GARCA.
 *
 * IMPORTANT: This provides OBFUSCATION, not true security.
 * The encryption key is public (NEXT_PUBLIC_*) and visible in the browser.
 * Real security comes from HTTPS/TLS in production.
 * 
 * Purpose: Prevent credentials from appearing in plain text in:
 * - Browser network tab
 * - Server logs
 * - Error reports
 */

import CryptoJS from "crypto-js";

/**
 * Encryption key for credentials obfuscation.
 * MUST be set via NEXT_PUBLIC_ENCRYPTION_KEY environment variable.
 */
function getEncryptionKey(): string {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "[Security] NEXT_PUBLIC_ENCRYPTION_KEY not configured. " +
      "Generate one with: openssl rand -base64 32"
    );
  }
  return key;
}

/**
 * Encrypts a string using AES-256 encryption.
 * @param text - The text to encrypt
 * @returns The encrypted text as a base64 string
 * @throws Error if NEXT_PUBLIC_ENCRYPTION_KEY is not configured
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, getEncryptionKey()).toString();
}

/**
 * Decrypts an AES-256 encrypted string.
 * @param encryptedText - The encrypted text (base64 string)
 * @returns The decrypted plain text
 * @throws Error if NEXT_PUBLIC_ENCRYPTION_KEY is not configured
 */
export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypted credentials object.
 */
export interface EncryptedCredentials {
  cuit: string;
  password: string;
  encrypted: true;
}

/**
 * Encrypts credentials object for secure transmission.
 * @param cuit - CUIT number
 * @param password - User password
 * @returns Object with encrypted credentials
 */
export function encryptCredentials(cuit: string, password: string): EncryptedCredentials {
  return {
    cuit: encrypt(cuit),
    password: encrypt(password),
    encrypted: true,
  };
}

/**
 * Decrypted credentials object.
 */
export interface DecryptedCredentials {
  cuit: string;
  password: string;
}

/**
 * Decrypts credentials object.
 * @param encryptedCuit - Encrypted CUIT
 * @param encryptedPassword - Encrypted password
 * @returns Object with decrypted credentials
 */
export function decryptCredentials(encryptedCuit: string, encryptedPassword: string): DecryptedCredentials {
  return {
    cuit: decrypt(encryptedCuit),
    password: decrypt(encryptedPassword),
  };
}

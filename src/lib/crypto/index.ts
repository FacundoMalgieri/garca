/**
 * Cryptographic utilities for GARCA.
 *
 * Provides AES-256 encryption/decryption for sensitive data.
 * Note: Client-side encryption provides obfuscation, not true security.
 * Real security comes from HTTPS in production.
 */

import CryptoJS from "crypto-js";

/**
 * Encryption key for credentials.
 * In production, this should be an environment variable.
 */
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "garca-secure-key-2025";

/**
 * Encrypts a string using AES-256 encryption.
 * @param text - The text to encrypt
 * @returns The encrypted text as a base64 string
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts an AES-256 encrypted string.
 * @param encryptedText - The encrypted text (base64 string)
 * @returns The decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
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

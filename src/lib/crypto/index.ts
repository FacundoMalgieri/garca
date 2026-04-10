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

const KEY_SIZE = 256 / 32;
const ITERATIONS = 10000;

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

function deriveKey(passphrase: string, salt: CryptoJS.lib.WordArray) {
  return CryptoJS.PBKDF2(passphrase, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });
}

/**
 * Encrypts a string using AES-256-CBC with PBKDF2-derived key and random salt/IV.
 * Output format: base64(salt(16) + iv(16) + ciphertext)
 */
export function encrypt(text: string): string {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = deriveKey(getEncryptionKey(), salt);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
  const combined = salt.concat(iv).concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(combined);
}

/**
 * Decrypts a string produced by encrypt().
 * Extracts salt and IV from the payload, derives the key, and decrypts.
 */
export function decrypt(encryptedText: string): string {
  const data = CryptoJS.enc.Base64.parse(encryptedText);
  const words = data.words;

  const salt = CryptoJS.lib.WordArray.create(words.slice(0, 4), 16);
  const iv = CryptoJS.lib.WordArray.create(words.slice(4, 8), 16);
  const ciphertext = CryptoJS.lib.WordArray.create(words.slice(8), data.sigBytes - 32);

  const key = deriveKey(getEncryptionKey(), salt);
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
  const bytes = CryptoJS.AES.decrypt(cipherParams, key, { iv });
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

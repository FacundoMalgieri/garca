import { describe, expect, it } from "vitest";

import { decrypt, decryptCredentials, encrypt, encryptCredentials } from "./index";

describe("Crypto Utils", () => {
  describe("encrypt/decrypt", () => {
    it("should encrypt and decrypt a string", () => {
      const original = "test-string-123";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(original);
      expect(decrypted).toBe(original);
    });

    it("should produce different ciphertext for same input", () => {
      const text = "same-text";
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      // AES with random IV produces different ciphertext
      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it("should handle empty string", () => {
      const encrypted = encrypt("");
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe("");
    });

    it("should handle special characters", () => {
      const original = "contraseña-123!@#$%^&*()_+";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    it("should handle unicode characters", () => {
      const original = "テスト-🔐-пароль";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
  });

  describe("encryptCredentials", () => {
    it("should encrypt CUIT and password", () => {
      const cuit = "20123456789";
      const password = "myPassword123";

      const result = encryptCredentials(cuit, password);

      expect(result.encrypted).toBe(true);
      expect(result.cuit).not.toBe(cuit);
      expect(result.password).not.toBe(password);
    });

    it("should produce valid encrypted credentials", () => {
      const cuit = "20123456789";
      const password = "myPassword123";

      const encrypted = encryptCredentials(cuit, password);

      // Should be decryptable
      expect(decrypt(encrypted.cuit)).toBe(cuit);
      expect(decrypt(encrypted.password)).toBe(password);
    });
  });

  describe("decryptCredentials", () => {
    it("should decrypt credentials", () => {
      const cuit = "20123456789";
      const password = "myPassword123";

      const encrypted = encryptCredentials(cuit, password);
      const decrypted = decryptCredentials(encrypted.cuit, encrypted.password);

      expect(decrypted.cuit).toBe(cuit);
      expect(decrypted.password).toBe(password);
    });
  });

  describe("round-trip", () => {
    it("should encrypt and decrypt credentials correctly", () => {
      const originalCuit = "27345678901";
      const originalPassword = "SuperSecure!123";

      const encrypted = encryptCredentials(originalCuit, originalPassword);
      const decrypted = decryptCredentials(encrypted.cuit, encrypted.password);

      expect(decrypted.cuit).toBe(originalCuit);
      expect(decrypted.password).toBe(originalPassword);
    });
  });
});


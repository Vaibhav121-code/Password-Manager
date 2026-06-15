const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.PASSWORD_HASH_KEY =
  "test-password-hash-key-with-at-least-thirty-two-characters";

const {
  decryptPassword,
  encryptPassword,
  fingerprintPassword,
} = require("../src/utils/encryption");
const analyzePassword = require("../src/utils/passwordStrength");

test("AES-GCM encryption round-trips and uses a random IV", () => {
  const first = encryptPassword("Correct-Horse-42!");
  const second = encryptPassword("Correct-Horse-42!");

  assert.equal(decryptPassword(first), "Correct-Horse-42!");
  assert.notEqual(first.passwordCiphertext, second.passwordCiphertext);
  assert.notEqual(first.passwordIv, second.passwordIv);
});

test("password fingerprints detect equality without storing plaintext", () => {
  assert.equal(fingerprintPassword("same"), fingerprintPassword("same"));
  assert.notEqual(fingerprintPassword("same"), fingerprintPassword("different"));
});

test("password strength recognizes all four levels", () => {
  assert.equal(analyzePassword("abc").label, "Weak");
  assert.equal(analyzePassword("Password").label, "Medium");
  assert.equal(analyzePassword("Password123").label, "Strong");
  assert.equal(analyzePassword("Longer-Password-123!").label, "Very Strong");
});

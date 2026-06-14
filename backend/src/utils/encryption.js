const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const parseEncryptionKey = (value) => {
  if (!value) {
    throw new Error("ENCRYPTION_KEY is not configured.");
  }

  const key = /^[a-f0-9]{64}$/i.test(value)
    ? Buffer.from(value, "hex")
    : Buffer.from(value, "base64");

  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte key encoded as hex or base64.");
  }

  return key;
};

const encryptPassword = (password) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    parseEncryptionKey(process.env.ENCRYPTION_KEY),
    iv,
  );
  const ciphertext = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);

  return {
    passwordCiphertext: ciphertext.toString("base64"),
    passwordIv: iv.toString("base64"),
    passwordAuthTag: cipher.getAuthTag().toString("base64"),
  };
};

const decryptPassword = ({ passwordCiphertext, passwordIv, passwordAuthTag }) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    parseEncryptionKey(process.env.ENCRYPTION_KEY),
    Buffer.from(passwordIv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(passwordAuthTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(passwordCiphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
};

const fingerprintPassword = (password) => {
  if (!process.env.PASSWORD_HASH_KEY) {
    throw new Error("PASSWORD_HASH_KEY is not configured.");
  }

  return crypto
    .createHmac("sha256", process.env.PASSWORD_HASH_KEY)
    .update(password.normalize("NFKC"))
    .digest("hex");
};

module.exports = {
  decryptPassword,
  encryptPassword,
  fingerprintPassword,
  parseEncryptionKey,
};

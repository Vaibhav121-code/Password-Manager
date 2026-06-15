const { parseEncryptionKey } = require("../utils/encryption");

const validateEnvironment = () => {
  const required = ["MONGO_URI", "JWT_SECRET", "ENCRYPTION_KEY", "PASSWORD_HASH_KEY"];
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  if (process.env.PASSWORD_HASH_KEY.length < 32) {
    throw new Error("PASSWORD_HASH_KEY must contain at least 32 characters.");
  }

  parseEncryptionKey(process.env.ENCRYPTION_KEY);
};

module.exports = validateEnvironment;

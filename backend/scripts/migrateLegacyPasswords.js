const dotenv = require("dotenv");

dotenv.config();

const connectDatabase = require("../src/config/database");
const validateEnvironment = require("../src/config/environment");
const PasswordEntry = require("../src/models/PasswordEntry");
const User = require("../src/models/User");
const {
  encryptPassword,
  fingerprintPassword,
} = require("../src/utils/encryption");
const analyzePassword = require("../src/utils/passwordStrength");

const getArgument = (name) => {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument ? argument.slice(prefix.length) : null;
};

const migrate = async () => {
  validateEnvironment();
  await connectDatabase();

  const email = getArgument("email");
  const dryRun = process.argv.includes("--dry-run");
  if (!email) {
    throw new Error(
      "Provide the owner account with --email=user@example.com. Use --dry-run to inspect first.",
    );
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error(`No registered user exists for ${email}.`);
  }

  const legacyEntries = await PasswordEntry.collection
    .find({
      $and: [
        { $or: [{ owner: { $exists: false } }, { owner: null }] },
        { password: { $type: "string" } },
      ],
    })
    .toArray();

  console.log(
    `${dryRun ? "Found" : "Migrating"} ${legacyEntries.length} legacy password entries for ${email}.`,
  );

  if (dryRun || legacyEntries.length === 0) {
    return;
  }

  const operations = legacyEntries.map((entry) => {
    const strength = analyzePassword(entry.password);
    return {
      updateOne: {
        filter: { _id: entry._id },
        update: {
          $set: {
            owner: user._id,
            site: String(entry.site || "Unknown site"),
            username: String(entry.username || "Unknown username"),
            ...encryptPassword(entry.password),
            passwordFingerprint: fingerprintPassword(entry.password),
            passwordLength: entry.password.length,
            strengthScore: strength.score,
            strengthLabel: strength.label,
            ...(entry.id ? { legacyId: String(entry.id) } : {}),
            updatedAt: new Date(),
            createdAt: entry.createdAt || new Date(),
          },
          $unset: { password: "", id: "" },
        },
      },
    };
  });

  const result = await PasswordEntry.collection.bulkWrite(operations);
  console.log(`Migrated ${result.modifiedCount} entries successfully.`);
};

migrate()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require("mongoose");
    await mongoose.disconnect();
  });

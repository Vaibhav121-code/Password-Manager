const PasswordEntry = require("../models/PasswordEntry");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  decryptPassword,
  encryptPassword,
  fingerprintPassword,
} = require("../utils/encryption");
const analyzePassword = require("../utils/passwordStrength");

const serializeEntry = (entry, reuseCount = 1) => {
  const serialized = entry.toJSON();
  serialized.reuseCount = reuseCount;
  serialized.isReused = reuseCount > 1;
  return serialized;
};

const listPasswords = asyncHandler(async (req, res) => {
  const entries = await PasswordEntry.find({ owner: req.user.id })
    .select("+passwordFingerprint")
    .sort({ createdAt: -1 });

  const frequency = entries.reduce((counts, entry) => {
    counts.set(
      entry.passwordFingerprint,
      (counts.get(entry.passwordFingerprint) || 0) + 1,
    );
    return counts;
  }, new Map());

  res.json({
    success: true,
    passwords: entries.map((entry) =>
      serializeEntry(entry, frequency.get(entry.passwordFingerprint)),
    ),
  });
});

const createPassword = asyncHandler(async (req, res) => {
  const strength = analyzePassword(req.body.password);
  const entry = await PasswordEntry.create({
    owner: req.user.id,
    site: req.body.site,
    username: req.body.username,
    ...encryptPassword(req.body.password),
    passwordFingerprint: fingerprintPassword(req.body.password),
    passwordLength: req.body.password.length,
    strengthScore: strength.score,
    strengthLabel: strength.label,
  });

  res.status(201).json({
    success: true,
    password: serializeEntry(entry),
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const entry = await PasswordEntry.findOne({
    _id: req.params.id,
    owner: req.user.id,
  }).select(
    "+passwordCiphertext +passwordIv +passwordAuthTag +passwordFingerprint",
  );

  if (!entry) {
    throw new AppError("Password entry was not found.", 404);
  }

  entry.site = req.body.site;
  entry.username = req.body.username;

  if (req.body.password) {
    const strength = analyzePassword(req.body.password);
    Object.assign(entry, encryptPassword(req.body.password));
    entry.passwordFingerprint = fingerprintPassword(req.body.password);
    entry.passwordLength = req.body.password.length;
    entry.strengthScore = strength.score;
    entry.strengthLabel = strength.label;
  }

  await entry.save();
  res.json({ success: true, password: serializeEntry(entry) });
});

const deletePassword = asyncHandler(async (req, res) => {
  const deleted = await PasswordEntry.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!deleted) {
    throw new AppError("Password entry was not found.", 404);
  }

  res.json({ success: true, message: "Password deleted." });
});

const revealPassword = asyncHandler(async (req, res) => {
  const entry = await PasswordEntry.findOne({
    _id: req.params.id,
    owner: req.user.id,
  }).select("+passwordCiphertext +passwordIv +passwordAuthTag");

  if (!entry) {
    throw new AppError("Password entry was not found.", 404);
  }

  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    password: decryptPassword(entry),
  });
});

module.exports = {
  createPassword,
  deletePassword,
  listPasswords,
  revealPassword,
  updatePassword,
};

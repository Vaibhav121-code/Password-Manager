const mongoose = require("mongoose");

const passwordEntrySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    site: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },
    passwordCiphertext: {
      type: String,
      required: true,
      select: false,
    },
    passwordIv: {
      type: String,
      required: true,
      select: false,
    },
    passwordAuthTag: {
      type: String,
      required: true,
      select: false,
    },
    passwordFingerprint: {
      type: String,
      required: true,
      select: false,
    },
    passwordLength: {
      type: Number,
      required: true,
      min: 0,
    },
    strengthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strengthLabel: {
      type: String,
      required: true,
      enum: ["Weak", "Medium", "Strong", "Very Strong"],
    },
    legacyId: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true },
);

passwordEntrySchema.index({ owner: 1, createdAt: -1 });
passwordEntrySchema.index({ owner: 1, passwordFingerprint: 1 });

passwordEntrySchema.set("toJSON", {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.owner;
    delete returnedObject.passwordCiphertext;
    delete returnedObject.passwordIv;
    delete returnedObject.passwordAuthTag;
    delete returnedObject.passwordFingerprint;
  },
});

module.exports = mongoose.model("PasswordEntry", passwordEntrySchema, "passwords");

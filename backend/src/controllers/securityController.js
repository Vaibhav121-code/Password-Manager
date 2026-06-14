const mongoose = require("mongoose");

const PasswordEntry = require("../models/PasswordEntry");
const asyncHandler = require("../utils/asyncHandler");

const getSecuritySummary = asyncHandler(async (req, res) => {
  const [result] = await PasswordEntry.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              weak: {
                $sum: { $cond: [{ $eq: ["$strengthLabel", "Weak"] }, 1, 0] },
              },
              medium: {
                $sum: { $cond: [{ $eq: ["$strengthLabel", "Medium"] }, 1, 0] },
              },
              strong: {
                $sum: {
                  $cond: [
                    { $in: ["$strengthLabel", ["Strong", "Very Strong"]] },
                    1,
                    0,
                  ],
                },
              },
              veryStrong: {
                $sum: {
                  $cond: [
                    { $eq: ["$strengthLabel", "Very Strong"] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        reused: [
          {
            $group: {
              _id: "$passwordFingerprint",
              count: { $sum: 1 },
            },
          },
          { $match: { count: { $gt: 1 } } },
          {
            $group: {
              _id: null,
              reusedPasswordGroups: { $sum: 1 },
              reusedPasswords: { $sum: "$count" },
            },
          },
        ],
      },
    },
  ]);

  const summary = result.summary[0] || {
    total: 0,
    weak: 0,
    medium: 0,
    strong: 0,
    veryStrong: 0,
  };
  const reused = result.reused[0] || {
    reusedPasswordGroups: 0,
    reusedPasswords: 0,
  };

  delete summary._id;
  delete reused._id;

  res.json({ success: true, metrics: { ...summary, ...reused } });
});

module.exports = { getSecuritySummary };

const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { cookieName } = require("../utils/token");

const authenticate = asyncHandler(async (req, res, next) => {
  const bearerToken = req.get("authorization")?.startsWith("Bearer ")
    ? req.get("authorization").slice(7)
    : null;
  const token = req.cookies[cookieName()] || bearerToken;

  if (!token) {
    throw new AppError("Authentication is required.", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Your session is invalid or has expired.", 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError("The user for this session no longer exists.", 401);
  }

  req.user = user;
  next();
});

module.exports = authenticate;

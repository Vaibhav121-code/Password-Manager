const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { clearAuthCookie, sendAuthCookie } = require("../utils/token");

const register = asyncHandler(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  sendAuthCookie(res, user.id);
  res.status(201).json({ success: true, user });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  const passwordMatches = user
    ? await user.comparePassword(req.body.password)
    : false;

  if (!user || !passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  sendAuthCookie(res, user.id);
  user.password = undefined;
  res.json({ success: true, user });
});

const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out successfully." });
};

const getCurrentUser = (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  getCurrentUser,
  login,
  logout,
  register,
};

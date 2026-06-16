const jwt = require("jsonwebtoken");

const cookieName = () => process.env.COOKIE_NAME || "passop_token";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: (Number(process.env.JWT_COOKIE_DAYS) || 7) * 24 * 60 * 60 * 1000,
  path: "/",
});

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendAuthCookie = (res, userId) => {
  res.cookie(cookieName(), signToken(userId), cookieOptions());
};

const clearAuthCookie = (res) => {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(cookieName(), options);
};

module.exports = {
  clearAuthCookie,
  cookieName,
  sendAuthCookie,
};

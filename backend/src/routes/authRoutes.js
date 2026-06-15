const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");

const {
  getCurrentUser,
  login,
  logout,
  register,
} = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

const emailValidation = body("email")
  .trim()
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

router.post(
  "/register",
  authLimiter,
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage("Name must be between 2 and 80 characters."),
    emailValidation,
    body("password")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters.")
      .matches(/[a-z]/)
      .withMessage("Password must include a lowercase letter.")
      .matches(/[A-Z]/)
      .withMessage("Password must include an uppercase letter.")
      .matches(/\d/)
      .withMessage("Password must include a number.")
      .matches(/[^A-Za-z0-9]/)
      .withMessage("Password must include a symbol."),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
  ],
  validateRequest,
  register,
);

router.post(
  "/login",
  authLimiter,
  [
    emailValidation,
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login,
);

router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;

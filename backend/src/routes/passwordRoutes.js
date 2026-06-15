const express = require("express");
const { body, param } = require("express-validator");

const {
  createPassword,
  deletePassword,
  listPasswords,
  revealPassword,
  updatePassword,
} = require("../controllers/passwordController");
const authenticate = require("../middleware/authenticate");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

const identifierValidation = param("id")
  .isMongoId()
  .withMessage("Invalid password entry identifier.");
const entryValidation = [
  body("site")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Site is required and must be under 500 characters."),
  body("username")
    .trim()
    .isLength({ min: 1, max: 320 })
    .withMessage("Username is required and must be under 320 characters."),
];

router
  .route("/")
  .get(listPasswords)
  .post(
    [
      ...entryValidation,
      body("password")
        .isLength({ min: 1, max: 1024 })
        .withMessage("Password is required and must be under 1024 characters."),
    ],
    validateRequest,
    createPassword,
  );

router.put(
  "/:id",
  [
    identifierValidation,
    ...entryValidation,
    body("password")
      .optional({ values: "falsy" })
      .isLength({ max: 1024 })
      .withMessage("Password must be under 1024 characters."),
  ],
  validateRequest,
  updatePassword,
);
router.delete("/:id", identifierValidation, validateRequest, deletePassword);
router.post("/:id/reveal", identifierValidation, validateRequest, revealPassword);

module.exports = router;

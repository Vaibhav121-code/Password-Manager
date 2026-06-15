const { validationResult } = require("express-validator");

const AppError = require("../utils/AppError");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  const details = errors.array().map(({ path, msg }) => ({
    field: path,
    message: msg,
  }));
  next(new AppError("Please correct the highlighted fields.", 400, details));
};

module.exports = validateRequest;

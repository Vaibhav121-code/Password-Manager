const errorHandler = (error, req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "An unexpected error occurred.";

  if (error.code === 11000) {
    statusCode = 409;
    message = "An account with that email already exists.";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "The requested resource identifier is invalid.";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(" ");
  }

  if (statusCode >= 500) {
    console.error(error);
    if (process.env.NODE_ENV === "production") {
      message = "An unexpected server error occurred.";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { errors: error.details } : {}),
  });
};

module.exports = errorHandler;

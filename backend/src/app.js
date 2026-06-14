const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const securityRoutes = require("./routes/securityRoutes");
const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors((req, callback) => {
    const requestOrigin = `${req.protocol}://${req.get("host")}`;

    callback(null, {
      origin(origin, originCallback) {
        if (
          !origin ||
          origin === requestOrigin ||
          allowedOrigins.includes(origin)
        ) {
          originCallback(null, true);
          return;
        }
        originCallback(new AppError("Origin is not allowed by CORS.", 403));
      },
      credentials: true,
    });
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/security", securityRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDirectory = path.resolve(__dirname, "../../dist");

  app.use(express.static(frontendDirectory));
  app.use((req, res, next) => {
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api/") &&
      req.accepts("html")
    ) {
      res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
        if (error) {
          next(error);
        }
      });
      return;
    }
    next();
  });
}

app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found.`, 404));
});

app.use(errorHandler);

module.exports = app;

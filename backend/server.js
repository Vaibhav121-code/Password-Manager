const dotenv = require("dotenv");

dotenv.config();

const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const validateEnvironment = require("./src/config/environment");

const startServer = async () => {
  validateEnvironment();
  await connectDatabase();

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`PassOP API listening on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Unable to start the server:", error.message);
  process.exit(1);
});

const mongoose = require("mongoose");

const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
};

module.exports = connectDatabase;

const express = require("express");

const { getSecuritySummary } = require("../controllers/securityController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.get("/summary", authenticate, getSecuritySummary);

module.exports = router;

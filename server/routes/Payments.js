const express = require("express");
const { auth, isStudent } = require("../middlewares/auth");
const { capturePayment, verifySignature } = require("../controllers/Payments");
const router = express.Router();

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature);

module.exports = router;
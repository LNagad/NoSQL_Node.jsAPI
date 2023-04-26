const express = require("express");

const { body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controllers/auth");
const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password").trim().not().isEmpty(),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;

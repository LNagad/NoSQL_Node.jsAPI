const User = require("../models/user");

const { validationResult } = require("express-validator");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  try {
    const emailExist = await User.findOne({ email: email });

    if (emailExist) {
      const error = new Error("Email address already exists!");
      error.statusCode = 422;
      throw error;
    }

    const passwordHashed = await bcrypt.hash(password, 12);

    const user = new User({ email, password: passwordHashed, name });

    const result = await user.save();

    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const equal = await bcrypt.compare(password, user.password);

    if (!equal) {
      const error = new Error("Invalid password");
      error.statusCode = 404;
      throw error;
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "myNagadSuperSecret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

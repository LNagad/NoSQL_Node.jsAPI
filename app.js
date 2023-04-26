require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const dir = "./images";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// ? Basically this parse incoming data to json
app.use(bodyParser.json()); // application/json

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  // Log the error to a file or database
  console.log(error);

  const message = error.message;

  const status = error.statusCode || 500;

  const data = error.data;

  res.status(status).json({ message, data });
});

const PORT = process.env.PORT ?? 3001;
const DB_URL = process.env.DB_URL;

mongoose
  .connect(DB_URL)
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`App is running on http://localhost:${PORT}/`);
    });
  })
  .catch((err) => console.log(err));

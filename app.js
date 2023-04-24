require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");

const app = express();
const fs = require("fs");

const dir = "./images";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
  createDestPath: true, // Agregar esta opción para crear la ruta de destino si aún no existe
});

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

// ? Basically this parse incoming data to json
app.use(bodyParser.json()); // application/json

app.use(multer({ storage: fileStorage }).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message });
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

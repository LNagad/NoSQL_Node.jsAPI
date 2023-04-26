const fs = require("fs");
const path = require("path");

exports.clearImage = (filepath) => {
  const dirFilePath = path.join(__dirname, "..", filepath);

  fs.unlinkSync(dirFilePath, (err) => console.log(err));
};

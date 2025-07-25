const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // set the destination folder
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    // set the filename
    cb(null, file.fieldname);
  },
});

const upload = multer({ storage });

module.exports = upload;

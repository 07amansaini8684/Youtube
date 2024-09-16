import multer from "multer";
import path from "path";
import crypto from "crypto";

// Define storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in the './public/temp' folder temporarily
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Generate a random 12-byte hex string as the filename
    crypto.randomBytes(12, (err, randomName) => {
      if (err) {
        return cb(err);
      }
      // Append the file extension to the random filename
      cb(null, randomName.toString("hex") + path.extname(file.originalname));
    });
  },
});

// Initialize multer upload instance
const upload = multer({ storage: storage });

export default upload;

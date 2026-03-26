import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-images",
    allowed_formats: ["jpg", "png", "webp"],
    // transformation: [{ width: 500, height: 500, crop: "fill" }], 
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Ensure uploads folder exists
// const uploadDir = "uploads/profiles";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // diskStorage tells multer WHERE and HOW to save files
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadDir); // save to uploads/profiles/
//   },
//   filename: (_req, file, cb) => {
//     // create unique filename: timestamp-randomnumber.ext
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// // fileFilter rejects non-image files before they're even saved
// const fileFilter = (_req, file, cb) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true); // accept
//   } else {
//     cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false); // reject
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
// });

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "manager", "employee"],
    default: "employee",
    required: true,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  profileImage: {
    url: String, // Cloudinary URL — use this to display the image
    publicId: String, // Cloudinary public_id — use this to delete the image
  },
  // profileImage: {
  //   filename: String,
  //   originalName: String,
  //   mimetype: String,
  //   size: Number,
  //   path: String,
  // },
});

const User = mongoose.model("User", userSchema);

export default User;

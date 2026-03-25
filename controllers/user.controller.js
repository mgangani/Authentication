import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../utils/generateJWT.js";
import { sendEmail } from "../utils/mailer.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: "employee",
    });
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error creating user",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const doMatch = await bcrypt.compare(password, user.password);
  if (!doMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.status(200).json({
    message: "Login successful",
    accessToken,
    refreshToken,
    user,
  });
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = await verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  console.log("getProfile controller", req.user);
  const user = await User.findById(req.user.id).select("-password");
  return res.status(200).json({
    message: "Profile fetched successfully",
    user,
  });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  if (!users) {
    return res.status(400).json({ message: "No users found" });
  }
  return res.status(200).json({
    message: "Users fetched successfully",
    users,
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const decoded = await verifyAccessToken(token);
  if (!decoded) {
    return res.status(400).json({ message: "Invalid token" });
  }
  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(400).json({ message: "Invalid token" });
  }
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  return res.status(200).json({ message: "Password reset successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  const token = generateAccessToken(user);
  await sendEmail(
    email,
    "Reset Password",
    `<p>You requested a password reset</p><p>Click <a href="http://localhost:3000/reset/${token}">here</a> to set a new password</p>`,
  );
  return res.status(200).json({ message: "Password reset email sent" });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { name, email, role },
    { new: true },
  );
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  return res.status(200).json({ message: "User updated successfully", user });
};

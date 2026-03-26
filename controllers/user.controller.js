import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../utils/generateJWT.js";
import { sendEmail } from "../utils/mailer.js";
import fs from "fs";
import path from "path";

export const signup = async (req, res) => {
  try {
    const { name, email: userEmail, password, role } = req.body;
    const email = userEmail.toLowerCase();
    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: role || "employee",
    });
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;
    const email = userEmail.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
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
  } catch (err) {
    return res.status(500).json({
      message: "Failed to log in",
      error: err.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
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
  } catch (err) {
    return res.status(500).json({
      message: "Failed to log out",
      error: err.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch users",
      error: err.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = await verifyAccessToken(token);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email: userEmail } = req.body;
    const email = userEmail.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateAccessToken(user);
    await sendEmail(
      email,
      "Reset Password",
      `<p>You requested a password reset</p><p>Click <a href="http://localhost:5000/reset/${token}">here</a> to set a new password</p>`,
    );
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to send password reset email",
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
};

export const createInitialAdmin = async (req, res) => {
  try {
    const { name, email: userEmail, password } = req.body;
    const email = userEmail.toLowerCase();
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      return res.status(403).json({
        message: "Initial admin already created",
      });
    }

    const exists = await User.exists({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: "admin",
    });

    return res.status(201).json({
      message: "Initial admin created successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to create initial admin",
      error: err.message,
    });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.profileImage?.path && fs.existsSync(user.profileImage.path)) {
      fs.unlinkSync(user.profileImage.path);
    }

    user.profileImage = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    await user.save();

    return res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Upload failed", error: err.message });
  }
};

// DOWNLOAD / SERVE profile image
export const getProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("profileImage");
    if (!user || !user.profileImage?.path) {
      return res.status(404).json({ message: "No profile image found" });
    }

    const filePath = user.profileImage.path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // res.sendFile() streams the file back to the client
    // It needs an absolute path
    // return res.sendFile(path.resolve(filePath));

    // --- ALTERNATIVE: force browser to download instead of display ---
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${user.profileImage.originalName}"`,
    );
    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to get image", error: err.message });
  }
};

// DELETE profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profileImage?.path) {
      return res.status(404).json({ message: "No profile image to delete" });
    }

    // Delete from disk
    if (fs.existsSync(user.profileImage.path)) {
      fs.unlinkSync(user.profileImage.path);
    }

    // Clear from DB
    user.profileImage = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Profile image deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete image", error: err.message });
  }
};

import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../utils/generateJWT.js";
import { sendEmail } from "../utils/mailer.js";
import cloudinary from "../config/cloudinary.js";
import { regex } from "zod";
import Payment from "../models/Payment.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
});

const issueTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user._id);

  return { accessToken, refreshToken };
};

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

    const { accessToken, refreshToken } = issueTokens(user);

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to log in",
      error: err.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: currentRefreshToken } = req.body;
    const decoded = verifyRefreshToken(currentRefreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken } = issueTokens(user);

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
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
    const page = Math.max(1, parseInt(req.query.page) || 1);

    const limit =
      req.query.limit !== undefined
        ? Math.min(200, parseInt(req.query.limit))
        : 10;

    if (limit <= 0) {
      return res.status(400).json({
        message: "Limit must be greater than 0",
      });
    }
    const skip = (page - 1) * limit;

    const filters = {};

    const search = req.query.search || "";

    if (search) {
      filters["user.name"] = { $regex: search, $options: "i" };
    }

    if (req.query.role) {
      filters["user.role"] = { $in: [req.query.role] };
    } else {
      filters["user.role"] = {
        $in: ["employee", "manager", "admin"],
      };
    }
    if (req.query.paymentAmount) {
      filters["amount"] = Number(req.query.paymentAmount);
    }

    if (req.query.paymentStatus) {
      filters.status = { $in: [req.query.paymentStatus] };
    } else {
      filters.status = {
        $in: ["pending", "succeeded", "failed", "refunded"],
      };
    }

    const results = await Payment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: filters,
      },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 0,
                user: {
                  id: "$user._id",
                  name: "$user.name",
                  email: "$user.email",
                  role: "$user.role",
                },
                payment: {
                  id: "$_id",
                  amount: "$amount",
                  status: "$status",
                },
              },
            },
            { $skip: skip },
            { $limit: limit },
          ],
          pagination: [
            { $count: "total" },
            {
              $addFields: {
                totalPages: { $ceil: { $divide: ["$total", limit] } },
              },
            },
            { $addFields: { hasNextPage: { $lt: [page, "$totalPages"] } } },
            { $addFields: { hasPrevPage: { $gt: [page, 1] } } },
          ],
        },
      },
    ]);

    return res.status(200).json({
      message: "Users fetched successfully",
      data: results[0].data,
      pagination: results[0].pagination,
    });

    // const [users, totalUsers] = await Promise.all([
    //   User.find(searchQuery).select("-password").skip(skip).limit(limit),
    //   User.countDocuments(searchQuery),
    // ]);

    // const totalPages = Math.ceil(totalUsers / limit);

    // return res.status(200).json({
    //   message: "Users fetched successfully",
    //   pagination: {
    //     totalUsers,
    //     totalPages,
    //     currentPage: page,
    //     limit,
    //     hasNextPage: page < totalPages,
    //     hasPrevPage: page > 1,
    //   },
    //   users,
    // });
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
    const url = process.env.FRONTEND_RESET_PASSWORD_URL;
    await sendEmail(
      email,
      "Reset Password",
      `<p>You requested a password reset</p><p>Click <a href="${url}/${token}">here</a> to set a new password</p>`,
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

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete old image from Cloudinary if exists
    if (user.profileImage?.publicId) {
      await cloudinary.uploader.destroy(user.profileImage.publicId);
    }

    user.profileImage = {
      url: req.file.path,
      publicId: req.file.filename,
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

// DELETE profile image
export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.profileImage?.publicId) {
      return res.status(404).json({ message: "No profile image to delete" });
    }

    await cloudinary.uploader.destroy(user.profileImage.publicId);

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

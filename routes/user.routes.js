import express from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  resetPassword,
  forgotPassword,
  updateUser,
  getUsers,
  createInitialAdmin,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/jwt.js";
import { authorize, authorizeOwnerOr } from "../middlewares/authorize.js";
import PERMISSIONS from "../config/permissions.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  setupAdminSchema,
  signupSchema,
  updateUserSchema,
} from "../validators/user.schema.js";
import { upload } from "../config/multer.js";

const router = express.Router();
router.post(
  "/signup",
  verifyJWT,
  authorize(PERMISSIONS.USERS_CREATE),
  validate(signupSchema),
  signup,
);
router.post("/setup-admin", validate(setupAdminSchema), createInitialAdmin);
router.get("/", verifyJWT, authorize(PERMISSIONS.USERS_VIEW), getUsers);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyJWT, logout);
router.get(
  "/profile",
  verifyJWT,
  authorize(PERMISSIONS.PROFILE_VIEW),
  getProfile,
);
router.put(
  "/:id",
  verifyJWT,
  authorizeOwnerOr(PERMISSIONS.USERS_EDIT),
  validate(updateUserSchema),
  updateUser,
);

//reset and forgot password routes
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword,
);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// Upload profile image
router.post(
  "/profile/image",
  verifyJWT,
  upload.single("profileImage"), // "profileImage" = the form field name
  uploadProfileImage,
);

// Delete image
router.delete("/profile/image", verifyJWT, deleteProfileImage);


export default router;

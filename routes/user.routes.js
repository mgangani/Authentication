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
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/jwt.js";
import { authorize, authorizeOwnerOr } from "../middlewares/authorize.js";
import PERMISSIONS from "../config/permissions.js";

const router = express.Router();

router.post("/signup", verifyJWT,authorize(PERMISSIONS.USERS_CREATE), signup);
router.get("/", verifyJWT, authorize(PERMISSIONS.USERS_VIEW), getUsers);
router.post("/login", login);
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
  updateUser,
);

//reset and forgot password routes
router.post("/reset-password/:token", resetPassword);
router.post("/forgot-password", forgotPassword);

export default router;

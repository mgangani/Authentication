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
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/jwt.js";
import { authorize, authorizeOwnerOr } from "../middlewares/authorize.js";
import PERMISSIONS from "../config/permissions.js";

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Create a new user account
 *     description: Requires a caller with the `users:create` permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post("/signup", verifyJWT, authorize(PERMISSIONS.USERS_CREATE), signup);
/**
 * @swagger
 * /api/users/setup-admin:
 *   post:
 *     summary: Create the first admin user
 *     description: This endpoint works only when there are zero users in the database.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Initial admin created successfully
 *       400:
 *         description: User already exists
 *       403:
 *         description: Initial admin already created
 *       500:
 *         description: Server error
 */
router.post("/setup-admin", createInitialAdmin);
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", verifyJWT, authorize(PERMISSIONS.USERS_VIEW), getUsers);
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Returns access and refresh tokens and also sets them as cookies.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", login);
/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", verifyJWT, logout);
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/profile",
  verifyJWT,
  authorize(PERMISSIONS.PROFILE_VIEW),
  getProfile,
);
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/:id",
  verifyJWT,
  authorizeOwnerOr(PERMISSIONS.USERS_EDIT),
  updateUser,
);

//reset and forgot password routes
/**
 * @swagger
 * /api/users/reset-password/{token}:
 *   post:
 *     summary: Reset a password with a reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token
 */
router.post("/reset-password/:token", resetPassword);
/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Send a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: User not found
 */
router.post("/forgot-password", forgotPassword);

export default router;

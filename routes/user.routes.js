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
  getProfileImage,
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation failed or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  "/signup",
  verifyJWT,
  authorize(PERMISSIONS.USERS_CREATE),
  validate(signupSchema),
  signup,
);
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
 *             allOf:
 *               - $ref: '#/components/schemas/SignupRequest'
 *             example:
 *               name: Super Admin
 *               email: admin@example.com
 *               password: StrongPassword123
 *     responses:
 *       201:
 *         description: Initial admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation failed or user already exists
 *       403:
 *         description: Initial admin already created
 *       500:
 *         description: Server error
 */
router.post("/setup-admin", validate(setupAdminSchema), createInitialAdmin);
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
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
 *         description: Validation failed
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post("/login", validate(loginSchema), login);
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthoriz ed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  verifyJWT,
  authorizeOwnerOr(PERMISSIONS.USERS_EDIT),
  validate(updateUserSchema),
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Validation failed or token is invalid/expired
 *       404:
 *         description: User not found
 */
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword,
);
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Validation failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// Upload profile image
router.post(
  "/profile/image",
  verifyJWT,
  upload.single("profileImage"), // "profileImage" = the form field name
  uploadProfileImage,
);

// Get/Download image by user ID - public route
router.get("/profile/image/:id", getProfileImage);

// Delete image
router.delete("/profile/image", verifyJWT, deleteProfileImage);


export default router;

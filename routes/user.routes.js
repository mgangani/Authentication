import express from 'express';
import { signup, login, logout, getProfile, resetPassword, forgotPassword } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/jwt.js';
import { validate } from '../middlewares/validation.middleware.js';
import { signupSchema } from '../validators/user.schema.js';

const router = express.Router();

router.post('/api/users/signup', validate(signupSchema), signup);
router.post('/api/users/login', login);
router.post('/api/users/logout', logout);
router.get("/api/users/profile", verifyJWT, getProfile);

//reset and forgot password routes
router.post('/api/users/reset-password/:token', resetPassword);
router.post('/api/users/forgot-password', forgotPassword);

// router.post("/api/users/refresh-token", refreshAccessToken);


export default router;
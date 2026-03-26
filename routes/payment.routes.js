// routes/payment.routes.js
import express from "express";
import {
  createPaymentIntent,
  handleWebhook,
  getPayments,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/jwt.js";

const router = express.Router();

// Webhook MUST use raw body — register BEFORE express.json() parses it
// This is why it needs to be handled specially in app.js (see below)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

router.post("/create-payment-intent", verifyJWT, createPaymentIntent);
router.get("/", verifyJWT, getPayments);

export default router;

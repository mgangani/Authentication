// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripePaymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // always in smallest unit (paise/cents)
    currency: { type: String, default: "inr" }, // inr for India, usd for US
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    description: String,
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);

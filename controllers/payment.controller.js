import Stripe from "stripe";
import Payment from "../models/Payment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr", description } = req.body;

    // amount must be in smallest unit — paise for INR, cents for USD
    // so ₹500 = 50000 paise
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      description,
      metadata: { userId: req.user.userId }, // attach your user id
    });

    // Save a pending record in your DB
    await Payment.create({
      userId: req.user.userId,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      description,
      status: "pending",
    });

    console.log("paymentIntent", paymentIntent);
    // Send client_secret to frontend — it needs this to confirm the payment
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Payment failed", error: err.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // req.body must be raw buffer here — NOT parsed JSON (see routes note below)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  // Handle the events you care about
  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "succeeded" },
      );
      // → here you'd also: fulfill the order, send confirmation email, etc.
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "failed" },
      );
      break;
    }
  }

  // Always return 200 to Stripe — otherwise it retries the webhook
  return res.status(200).json({ received: true });
};

// Get payment history for logged-in user
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ payments });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch payments", error: err.message });
  }
};

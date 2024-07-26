require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const bodyParser = require("body-parser");
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);

router.post("/create-checkout-session", async (req, res) => {
  const { amount, wishlistId, userId } = req.body; // Assume amount is in the smallest currency unit (e.g., cents)

  try {
    const { teacherId } = await knex("WishlistItem")
      .select("teacherId")
      .where({ wishlistItemId: wishlistId })
      .first();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Donation for Wishlist ID: ${wishlistId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/classroom/${teacherId}/item/${wishlistId}`,
      metadata: {
        userId: userId || "",
        wishlistId: wishlistId.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});
console.log("stripe_webhook.js file loaded");

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const feeUrl = (authUser.accounType =
      "parent" || !authUser
        ? `${BACKEND_URL}/transaction-fee/latest/parent`
        : `${BACKEND_URL}/transaction-fee/latest/business`);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      try {
        const { transactionFeeRate } = await axios.get(feeUrl);
        const session = event.data.object;

        // Use null for userId if it's empty, maintaining database integrity
        const userId = session.metadata.userId
          ? parseInt(session.metadata.userId, 10)
          : null;
        const wishlistId = parseInt(session.metadata.wishlistId, 10);
        const donationAmount =
          session.amount_total - session.amount_total * transactionFeeRate; // in the smallest currency unit

        // Insert into Donation table
        await knex("Donation").insert({
          userId, // This will be NULL if userId wasn't provided
          wishlistId,
          donationAmount,
        });
        console.log("Donation recorded successfully");
      } catch (error) {
        console.error("Error saving donation:", error);
      }
    }

    res.json({ received: true });
  }
);

router.post("/onboarding", async (req, res) => {
  try {
    // Create a new Express Stripe Connect account
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
      email: req.body.email, // Teacher's email to associate with Stripe account
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Generate an account link for onboarding or account update
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/profile`, // URL to redirect if the user needs to restart the account linking process
      return_url: `${process.env.FRONTEND_URL}/stripe-return`, // URL to redirect after the account linking process is completed
      type: "account_onboarding",
    });

    // Send the onboarding URL to the frontend
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe onboarding link creation failed:", error);
    res.status(500).json({
      message: "Failed to create Stripe onboarding link",
      error: error.message,
    });
  }
});

router.post("/update-stripe-account", async (req, res) => {
  const { userId, stripeAccountId } = req.body;

  try {
    await knex("Users").where({ userId }).update({ stripeAccountId });

    res.json({
      success: true,
      message: "Stripe account ID updated successfully.",
    });
  } catch (error) {
    console.error("Error updating Stripe account ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update Stripe account ID." });
  }
});

// Endpoint to finalize Stripe Connect account creation and update user record
router.post("/finalise-stripe-connect", async (req, res) => {
  const { email } = req.body;

  try {
    // Retrieve Stripe account ID from DB
    const accountCreationRequest = await knex("Users")
      .where({ email: email })
      .first();

    if (!accountCreationRequest) {
      return res
        .status(404)
        .json({ message: "Stripe account creation request not found." });
    }

    // Fetch account details from Stripe using the account ID stored in your request
    const accountDetails = await stripe.accounts.retrieve(
      accountCreationRequest.stripeAccountId
    );

    // Update user's record with Stripe account ID
    await knex("Users")
      .where({ email: email })
      .update({ stripeAccountId: accountDetails.id });

    res.json({
      success: true,
      message: "Stripe Connect account linked successfully.",
    });
  } catch (error) {
    console.error("Error finalizing Stripe Connect account:", error);
    res.status(500).json({
      message: "Failed to finalize Stripe Connect account.",
      error: error.message,
    });
  }
});

router.post("/withdraw-funds", async (req, res) => {
  const { userId } = req.body;

  try {
    console.log("Withdraw funds request received for userId:", userId);
    // Fetch teacher's Stripe account ID from DB
    const teacher = await knex("Users").where({ userId: userId }).first();
    const stripeAccountId = teacher.stripeAccountId;

    if (!stripeAccountId) {
      return res.status(400).json({
        success: false,
        message: "Stripe account ID not found for teacher.",
      });
    }

    const totalAmount = await knex("WishlistItem")
      .where({
        teacherId: userId,
        status: "completed",
        fundsTransferred: false,
        platformFulfillment: false,
      })
      .sum("currentValue as total")
      .first();

    const amountInPence = totalAmount.total * 100;

    // Prevent withdrawal attempt if balance is zero or undefined
    if (!amountInPence || amountInPence <= 0) {
      return res.status(400).json({
        success: false,
        message: "You have no funds to withdraw.",
        error: { code: "insufficient_funds" },
      });
    }

    // Create a payout to the connected Stripe account
    const payout = await stripe.payouts.create(
      {
        amount: totalAmount.total * 100, // Amount in pence
        currency: "gbp",
      },
      {
        stripeAccount: stripeAccountId, // Specifies the connected account to pay out to
      }
    );

    // Update DB to mark the funds as transferred
    await knex("WishlistItem")
      .where({
        teacherId: userId,
        status: "completed",
        fundsTransferred: false,
        platformFulfillment: false,
      })
      .update({ fundsTransferred: true, isMoneyWithdrawn: true });

    const stripeDashboardUrl = `https://dashboard.stripe.com/accounts/${stripeAccountId}`;
    res.json({
      success: true,
      message: "Funds withdrawn successfully.",
      payout,
      stripeDashboardUrl,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    const errorCode = error?.raw?.code || error?.code;
    const errorMessage =
      error?.raw?.message || error?.message || "An unexpected error occurred";

    res.status(500).json({
      success: false,
      message: "Failed to withdraw funds.",
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
});

module.exports = router;

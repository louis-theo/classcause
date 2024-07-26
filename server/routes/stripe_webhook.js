const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);
const bodyParser = require("body-parser");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process `checkout.session.completed` event
    if (event.type === "checkout.session.completed") {
      try {
        const session = event.data.object;
        // Extract metadata
        const userId = session.metadata.userId
          ? parseInt(session.metadata.userId)
          : null;

        let role = "parent";
        if (userId) {
          const { accountType } = await knex("Users")
            .select("accountType")
            .where({ userId: userId })
            .first();
          role = accountType ? accountType : "parent";
        }

        const { transactionRate } = await knex("TransactionFee")
          .where({ accountType: role })
          .orderBy("timeStamp", "desc")
          .first();

        console.log(session.amount_total);
        console.log(transactionRate);

        const wishlistId = parseInt(session.metadata.wishlistId);
        const donationAmount =
          (session.amount_total - session.amount_total * transactionRate) / 100;

        console.log(
          `Processing donation of ${donationAmount} for Wishlist ID ${wishlistId}, User ID: ${userId}`
        );

        await knex("Donation").insert({
          userId,
          wishlistId,
          donationAmount,
        });
        await knex("WishlistItem")
          .where({ wishlistItemId: wishlistId })
          .increment("currentValue", donationAmount);

        console.log(`Donation added to the database successfully.`);
        res.json({ received: true });
      } catch (error) {
        console.error(`Error inserting donation record into database:`, error);
        res.status(500).send("Error processing donation");
      }
    } else {
      console.log(`Received unhandled event type: ${event.type}`);
      res.status(400).end();
    }
  }
);

module.exports = router;

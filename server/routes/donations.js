// All tested and working

const express = require("express");
const router = express.Router();
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);

// Creating a record

router.post("/add", async (req, res) => {
  const { userId, wishlistId, donationAmount } = req.body;
  console.log("Received wishlistId:", wishlistId);
  try {
    const [donateId] = await knex("Donation").insert({
      userId: userId || null,
      wishlistId,
      donationAmount,
    });
    res.json({ success: true, donateId: donateId });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Couldn't create donation record: ${error.message}` });
  }
});

// check for wishlist items that have not been successful and for which a notification has not yet been sent.
router.get("/check-unsuccessful", async (req, res) => {
  try {
    const wishlistItems = await knex("WishlistItem")
      .select("*")
      .where("Noti_sent", "<>", 1);
    const unsuccessfulItems = [];

    for (const item of wishlistItems) {
      const { wishlistItemId, goalValue, deadline, currentValue } = item;
      const currentTime = new Date();

      if (
        currentTime > new Date(deadline) &&
        Number(currentValue) < Number(goalValue)
      ) {
        const donationUserIds = await knex("Donation")
          .join("FavouriteItem", function () {
            this.on("Donation.userId", "=", "FavouriteItem.userId").andOn(
              "Donation.wishlistId",
              "=",
              "FavouriteItem.wishlistItemId"
            );
          })
          .where("Donation.wishlistId", "=", wishlistItemId)
          .select("Donation.userId");

        if (donationUserIds.length > 0) {
          await knex("WishlistItem")
            .where("wishlistItemId", "=", wishlistItemId)
            .update({ Noti_sent: 1 });

          const itemWithUserIds = {
            ...item,
            donationUserIds: donationUserIds.map((donation) => donation.userId),
          };

          unsuccessfulItems.push(itemWithUserIds);
        }
      }
    }
    res.json({
      success: true,
      message: `${unsuccessfulItems.length} wishlist items were checked and updated.`,
      data: unsuccessfulItems,
    });
  } catch (error) {
    console.error(`Error checking wishlist items: ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Couldn't check wishlist items: ${error.message}`,
    });
  }
});

// Getting the total amount for item
router.get("/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const totalAmount = await knex("Donation")
      .where({ wishlistId: itemId })
      .sum("donationAmount as total")
      .first();
    res.json(totalAmount);
  } catch (error) {
    res.status(500).json({
      message: `Couldn't fetch total donation for item: ${error.message}`,
    });
  }
});

// Getting the total amount per user
router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const totalAmount = await knex("Donation")
      .where({ userId: userId })
      .sum("donationAmount as total")
      .first();
    res.json(totalAmount);
  } catch (error) {
    res.status(500).json({
      message: `Couldn't fetch total donation for user: ${error.message}`,
    });
  }
});

//check whether a specific wishlist item has reached its donation target
router.get("/check-target/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const wishlistItem = await knex("WishlistItem")
      .where({ wishlistItemId: itemId })
      .first();
    if (!wishlistItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    const isTargetReached = wishlistItem.currentValue >= wishlistItem.goalValue;

    res.json({
      success: true,
      isTargetReached,
      totalDonated: total,
      targetAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: `Couldn't check if target amount was reached: ${error.message}`,
    });
  }
});

module.exports = router;

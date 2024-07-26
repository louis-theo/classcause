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
// items that the parent has donated to
router.get("/users/:userId/donations", async (req, res) => {
  const { userId } = req.params;
  try {
    const donations = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .where("Donation.userId", userId)
      .select("WishlistItem.*");

    res.json(donations);
  } catch (error) {
    console.error("Failed to fetch donations:", error);
    res.status(500).json({
      message: `Error retrieving donations: ${error.message}`,
    });
  }
});

//get the other items that are active and belong to the wishlist of a teacher that the parent has already donated to
router.get("/users/:userId/other-active-items", async (req, res) => {
  const { userId } = req.params;
  try {
    const otherActiveItems = await knex("Donation")
      .distinct("WishlistItem.wishlistItemId")
      .join("Users", "Donation.userId", "=", "Users.userId")
      .join("WishlistItem", function () {
        this.on("WishlistItem.teacherId", "=", "Donation.userId").onIn(
          "WishlistItem.status",
          ["Active"]
        );
      })
      .where("Donation.userId", userId)
      .andWhere("Users.accountType", "Parent")
      .select("WishlistItem.*");
    res.json(otherActiveItems);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving other active items: ${error.message}`,
    });
  }
});

// one endpoint for all the parent metrics
router.get("/users/:userId/metrics", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await knex("Users").where({ userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the number of distinct items the parent has donated to
    const donationsCount = await knex("Donation")
      .countDistinct("wishlistId as count")
      .where("userId", userId);

    // Fetch the total amount of money the parent has donated
    const totalDonated = await knex("Donation")
      .sum("donationAmount as total")
      .where("userId", userId);

    // Fetch the count of donations done towards completed items
    const successfulDonationsCount = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .where("Donation.userId", userId)
      .andWhere("WishlistItem.status", "completed")
      .countDistinct("Donation.wishlistId as count");

    // Fetch the count of donations done towards completed items
    const activeDonationsCount = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .where("Donation.userId", userId)
      .andWhere("WishlistItem.status", "active")
      .countDistinct("Donation.wishlistId as count");

    // Fetch donation history for the parent
    const history = await knex("Donation")
      .join("Users", "Donation.userId", "=", "Users.userId")
      .select(
        knex.raw('DATE_FORMAT(Donation.donationTime, "%Y-%m") as month'), // Group by month
        "Donation.donationAmount"
      )
      .where("Donation.userId", userId)
      .orderBy("Donation.donationTime", "asc");

    const averageDonation =
      donationsCount[0].count > 0
        ? (totalDonated[0].total / donationsCount[0].count).toFixed(2)
        : 0;

    res.json({
      donationsCount: donationsCount[0].count,
      totalDonated: totalDonated[0].total,
      successfulDonationsCount: successfulDonationsCount[0].count,
      activeDonationsCount: activeDonationsCount[0].count,
      averageDonation: averageDonation,
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving metrics: ${error.message}`,
    });
  }
});

module.exports = router;

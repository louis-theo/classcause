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
router.get("/:teacherId/total-donated", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const totalDonations = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "WishlistItem.wishlistItemId"
      )
      .where("WishlistItem.teacherId", teacherId)
      .sum("Donation.donationAmount as total")
      .first();

    res.json({
      totalDonations: totalDonations.total || 0,
    });
  } catch (error) {
    console.error("Error fetching total donations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/donations-by-category", async (req, res) => {
  const teacherId = req.query.teacherId;

  if (!teacherId) {
    return res.status(400).send("Teacher ID is required");
  }

  try {
    const donationsByCategory = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .join("Users", "WishlistItem.teacherId", "=", "Users.userId")
      .join(
        "Categories",
        "WishlistItem.categoryId",
        "=",
        "Categories.categoryId"
      )
      .select("Categories.categoryName")
      .where("Users.userId", teacherId)
      .sum("Donation.donationAmount as totalDonated")
      .groupBy("Categories.categoryName")
      .orderBy("totalDonated", "desc");

    res.json(
      donationsByCategory.map((row) => ({
        categoryName: row.categoryName,
        totalDonated: parseFloat(row.totalDonated),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:teacherId/total-donations", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const donations = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .where("WishlistItem.teacherId", teacherId)
      .sum("donationAmount as totalDonated")
      .select("Donation.donationTime")
      .orderBy("Donation.donationTime", "asc");

    // Calculate total donations if necessary or just return the donations array
    const totalDonated = donations.reduce(
      (acc, donation) => acc + donation.totalDonated,
      0
    );

    res.json({
      totalDonated,
      donations: donations.map((donation) => ({
        ...donation,
        // Convert timestamp to a readable format if necessary
        donationTime: new Date(donation.donationTime).toLocaleString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving total donations: ${error.message}`,
    });
  }
});

//how many items in the teacher's wishlist have been successful
// GET /api/teachers/:teacherId/successful-items
router.get("/:teacherId/completed-items", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const count = await knex("WishlistItem")
      .count("wishlistItemId as completedCount")
      .where({ teacherId, status: "completed" })
      .first();
    res.json(count);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving completed items count: ${error.message}`,
    });
  }
});

// how many items in the teacher's wishlist are active but not completed
// GET /api/teachers/:teacherId/active-items
router.get("/:teacherId/active-items", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const count = await knex("WishlistItem")
      .count("wishlistItemId as activeCount")
      .where({ teacherId, status: "active" })
      .first();
    res.json(count);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving active items count: ${error.message}`,
    });
  }
});

// how many items in the teacher's wishlist are pending
// GET /api/teachers/:teacherId/pending-items
router.get("/:teacherId/pending-items", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const count = await knex("WishlistItem")
      .count("wishlistItemId as pendingCount")
      .where({ teacherId, status: "suggestion" })
      .first();
    res.json(count);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving pending items count: ${error.message}`,
    });
  }
});

// how much money has been donated in total to the teacher
// GET /api/teachers/:teacherId/total-donations
router.get("/:teacherId/total-donations", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const donations = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "=",
        "WishlistItem.wishlistItemId"
      )
      .where("WishlistItem.teacherId", teacherId)
      .sum("donationAmount as totalDonated")
      .select("Donation.donationTime")
      .orderBy("Donation.donationTime", "asc");

    // Calculate total donations if necessary or just return the donations array
    const totalDonated = donations.reduce(
      (acc, donation) => acc + donation.totalDonated,
      0
    );

    res.json({
      totalDonated,
      donations: donations.map((donation) => ({
        ...donation,
        // Convert timestamp to a readable format if necessary
        donationTime: new Date(donation.donationTime).toLocaleString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving total donations: ${error.message}`,
    });
  }
});

// how much money is still needed to be donated for all their items the be fully funded
// GET /api/teachers/:teacherId/remaining-funds
router.get("/:teacherId/remaining-funds", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const items = await knex("WishlistItem")
      .select("goalValue", "currentValue")
      .where("teacherId", teacherId);

    const remainingFunds = items.reduce(
      (acc, item) => acc + (item.goalValue - item.currentValue),
      0
    );

    res.json({ remainingFunds });
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving remaining funds needed: ${error.message}`,
    });
  }
});

// total number of items a teacher has wishlisted regardless of status

// GET /api/teachers/:teacherId/wishlist-items-count
router.get("/:teacherId/wishlist-items-count", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const count = await knex("WishlistItem")
      .count("wishlistItemId as totalCount")
      .where({ teacherId })
      .first();
    res.json(count);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving total wishlist items count: ${error.message}`,
    });
  }
});

// this is gna go into general metrics file: for an item on a teacher's wishlist what percentage of the full amount has been donated
// GET /api/wishlist-items/:wishlistItemId/donation-percentage
router.get(
  "/wishlist-items/:wishlistItemId/donation-percentage",
  async (req, res) => {
    const { wishlistItemId } = req.params;
    try {
      // Retrieve the goal value and current donation amount for the specified wishlist item
      const itemDetails = await knex("WishlistItem")
        .where("wishlistItemId", wishlistItemId)
        .select("goalValue", "currentValue")
        .first();

      if (!itemDetails) {
        return res.status(404).json({ message: "Wishlist item not found." });
      }

      const { goalValue, currentValue } = itemDetails;

      // Calculate the donation percentage
      const donationPercentage = ((currentValue / goalValue) * 100).toFixed(2); // Keeping two decimal places

      res.json({
        wishlistItemId,
        donationPercentage: `${donationPercentage}%`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error calculating donation percentage: ${error.message}`,
      });
    }
  }
);

router.get("/:teacherId/top-contributors", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await knex("Donation")
      .join(
        "WishlistItem",
        "Donation.wishlistId",
        "WishlistItem.wishlistItemId"
      )
      .leftJoin("Users", "Donation.userId", "Users.userId")
      .where("WishlistItem.teacherId", teacherId)
      .select(
        knex.raw(`
          IFNULL(CONCAT(Users.userFirstName, ' ', Users.userLastName), 'Anonymous User') AS name,
          SUM(Donation.donationAmount) AS totalDonation
        `)
      )
      .groupBy("Donation.userId")
      .orderBy("totalDonation", "desc")
      .limit(5);

    const contributors = result.map((row) => ({
      name: row.name,
      totalDonation: row.totalDonation,
    }));

    res.json(contributors);
  } catch (error) {
    console.error("Error fetching top contributors for teacher:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:teacherId/average-contributors", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const result = await knex.raw(
      `
          SELECT AVG(contributorCounts.contributors) AS averageContributors
          FROM (
              SELECT d.wishlistId, COUNT(DISTINCT d.userId) AS contributors
              FROM Donation AS d
              JOIN WishlistItem AS wi ON d.wishlistId = wi.wishlistItemId
              WHERE wi.teacherId = ?
              GROUP BY d.wishlistId
          ) AS contributorCounts
      `,
      [teacherId]
    );

    res.json(result[0][0]);
  } catch (error) {
    console.error(
      "Error fetching average contributors per wishlist item for teacher:",
      error
    );
    res.status(500).json({ error: error.message });
  }
});

// export
module.exports = router;

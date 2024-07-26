const express = require("express");
const router = express.Router();
const authorise = require("../middleware/auth");
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);
router.get("/metrics/donations-timeframe", async (req, res) => {
  const { timeframe, year } = req.query;

  try {
    let query;

    if (timeframe === "monthly") {
      query = knex("Donation")
        .select(
          knex.raw(
            `DATE_FORMAT(donationTime, '%Y-%m') AS period, COUNT(*) as count, SUM(donationAmount) as total`
          )
        )
        .where(knex.raw(`YEAR(donationTime) = ?`, [year]))
        .groupBy(knex.raw(`DATE_FORMAT(donationTime, '%Y-%m')`));
    } else if (timeframe === "yearly") {
      query = knex("Donation")
        .select(
          knex.raw(
            `YEAR(donationTime) AS period, COUNT(*) as count, SUM(donationAmount) as total`
          )
        )
        .groupBy(knex.raw(`YEAR(donationTime)`));
    } else {
      return res.status(400).json({ message: "Invalid timeframe specified" });
    }

    const donations = await query;

    res.json(donations);
  } catch (error) {
    res.status(500).json({
      message: `Error retrieving donations: ${error.message}`,
    });
  }
});

// total number of users registered, minus admin

router.get("/metrics/total-users", async (req, res) => {
  try {
    const totalUsers = await knex("Users")
    .count("* as count")
    .whereNot('accountType', 'admin');
    res.json(totalUsers[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of parent users registered

router.get("/metrics/parents-count", async (req, res) => {
  try {
    const parentsCount = await knex("Users")
      .where("accountType", "parent")
      .count("* as count");
    res.json(parentsCount[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of teachers users registered
router.get("/metrics/teachers-count", async (req, res) => {
  try {
    const teachersCount = await knex("Users")
      .where("accountType", "teacher")
      .count("* as count");
    res.json(teachersCount[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of businesses' registered

router.get("/metrics/businesses-count", async (req, res) => {
  try {
    const businessesCount = await knex("Users")
      .where("accountType", "business")
      .count("* as count");
    res.json(businessesCount[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of schools registered

router.get("/metrics/schools-count", async (req, res) => {
  try {
    const schoolsCount = await knex("Users")
      .where("accountType", "school")
      .count("* as count");
    res.json(schoolsCount[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// total number of donations made

router.get("/metrics/total-donations", async (req, res) => {
  try {
    const totalDonations = await knex("Donation").count("* as count");
    res.json(totalDonations[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// total number of successful item funding

router.get("/metrics/successful-fundings", async (req, res) => {
  try {
    const successfulFundings = await knex("WishlistItem")
      .where("status", "Successful")
      .count("* as count");
    res.json(successfulFundings[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// total number of items expired without sufficient funding

router.get("/metrics/expired-fundings", async (req, res) => {
  try {
    const expiredFundings = await knex("WishlistItem")
      .where("status", "Expired")
      .count("* as count");
    res.json(expiredFundings[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// total number of active items

router.get("/metrics/active-items", async (req, res) => {
  try {
    const activeItems = await knex("WishlistItem")
      .where("status", "Active")
      .count("* as count");
    res.json(activeItems[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// total number of items ever

router.get("/metrics/total-items", async (req, res) => {
  try {
    const totalItems = await knex("WishlistItem").count("* as count");
    res.json(totalItems[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of unique schools registered
router.get("/metrics/unique-schools", async (req, res) => {
  try {
    const result = await knex("Users")
      .distinct("school")
      .then((distinctSchools) => distinctSchools.length);
   
    res.json({ count: result });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of accounts registered to each school

router.get("/metrics/school-account-counts", async (req, res) => {
  try {
    const schoolCounts = await knex("Users")
      .select("school")
      .groupBy("school")
      .count("* as count");
    res.json(schoolCounts);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// number of stories

router.get("/metrics/total-stories", async (req, res) => {
  try {
    const totalStories = await knex("Story").count("* as count");
    res.json(totalStories[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/api/wishlist-items/new/count-by-month", async (req, res) => {
  try {
    const newItemsByMonth = await knex("WishlistItem")
      .select(
        knex.raw(
          `DATE_FORMAT(creationTime, '%Y-%m') AS period, COUNT(*) as count`
        )
      )
      .where(knex.raw(`YEAR(creationTime) = YEAR(CURDATE())`))
      .groupBy(knex.raw(`DATE_FORMAT(creationTime, '%Y-%m')`))
      .orderBy("period", "asc");

    res.json(newItemsByMonth);
  } catch (error) {
    console.error("Error fetching new wishlist items count by month:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/wishlist-items/resources", async (req, res) => {
  try {
    const resources = await knex("WishlistItem")
      .join("Categories", "WishlistItem.categoryId", "Categories.categoryId")
      .select("Categories.categoryName")
      .count("WishlistItem.wishlistItemId as count")
      .groupBy("Categories.categoryName");
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/wishlist-items/post-times", async (req, res) => {
  try {
    const postTimes = await knex("WishlistItem")
      .select(knex.raw("HOUR(creationTime) as hour"))
      .count("* as count")
      .groupByRaw("HOUR(creationTime)");
    res.json(postTimes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/wishlist-items/success-rate/by-month", async (req, res) => {
  try {
    const successRateByMonth = await knex("WishlistItem")
      .select(
        knex.raw(`
          DATE_FORMAT(creationTime, '%Y-%m') AS period,
          ROUND((SUM(CASE WHEN currentValue >= goalValue THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS successRate
        `)
      )
      .where(knex.raw(`YEAR(creationTime) = YEAR(CURDATE())`))
      .groupBy(knex.raw(`DATE_FORMAT(creationTime, '%Y-%m')`))
      .orderBy("period", "asc");

    res.json(successRateByMonth);
  } catch (error) {
    console.error("Error fetching wishlist success rate by month:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/wishlist-items/fully-funded", async (req, res) => {
  try {
    const fullyFunded = await knex("WishlistItem")
      .where("status", "Funded")
      .count("* as count");
    res.json(fullyFunded);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/wishlist-items/average-contributors", async (req, res) => {
  try {
    const result = await knex.raw(`
            SELECT AVG(contributors) as averageContributors
            FROM (
                SELECT count(DISTINCT userId) as contributors
                FROM Donation
                GROUP BY wishlistId
            ) AS contributorCounts
        `);

    res.json(result[0][0]);
  } catch (error) {
    console.error(
      "Error fetching average contributors per wishlist item:",
      error
    );
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/contributions/average-frequency", async (req, res) => {
  try {
    const result = await knex.raw(`
          SELECT AVG(contributions) as averageFrequency
          FROM (
              SELECT userId, COUNT(*) as contributions
              FROM Donation
              GROUP BY userId
          ) AS userContributions
      `);

    res.json(result[0][0]);
  } catch (error) {
    console.error(
      "Error fetching average contribution frequency per user:",
      error
    );
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/users/geography", async (req, res) => {
  try {
    const signups = await knex("Users")
      .join("Address", "Users.addressId", "Address.addressId")
      .select("Address.city")
      .countDistinct("Users.userId as count")
      .groupBy("Address.city");
    res.json(signups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// export
module.exports = router;

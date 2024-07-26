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

// Add bids on item
router.post("/add", async (req, res) => {
  const { advertisementId, businessID, price } = req.body;

  try {
    const minBid = await knex("Advertisement")
      .where("advertisementId", advertisementId)
      .select("startingPrice");

    if (price < parseInt(minBid[0].startingPrice)) {
      return res.status(400).json({
        message: `You need to meet the minimum bid amount £${minBid[0].startingPrice}`,
      });
    }

    const [advertisementBidderId] = await knex("AdvertisementBidder").insert({
      advertisementId,
      businessID: businessID,
      price,
      bidingDate: knex.fn.now(),
    });

    const highestBid = await knex("Advertisement")
      .where("advertisementId", advertisementId)
      .select("highestBiddingPrice");

    if (price > parseInt(highestBid[0].highestBiddingPrice)) {
      await knex("Advertisement")
        .update({ highestBidderId: businessID, highestBiddingPrice: price })
        .where("advertisementId", advertisementId);
    }
    res.json({
      success: true,
      advertisementBidderId: advertisementBidderId,
      advertisementId: advertisementId,
    });
  } catch (error) {
    res.status(500).json({ message: `${error.message}` });
  }
});

// Get all bid information by school id
router.get("", async (req, res) => {
  const { schoolId } = req.query;

  try {
    const bids = await knex("Advertisement")
      .join(
        "AdvertisementBidder",
        "Advertisement.advertisementId",
        "AdvertisementBidder.advertisementId"
      )
      .where("Advertisement.schoolId", schoolId)
      .select("*");
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: `Couldn't fetch bids: ${error.message}` });
  }
});

// Get all bids per item
router.get("/:itemId", async (req, res) => {
  const itemId = req.params.itemId;

  try {
    const bids = await knex("AdvertisementBidder")
      .where("advertisementId", itemId)
      .select("*");
    res.json(bids);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Couldn't fetch bids for item: ${error.message}` });
  }
});

// get bids for user
// Endpoint to fetch advertisements a user (identified by businessId in the query) has bid on
router.get("/:businessId/mine", async (req, res) => {
  const { businessId } = req.params;

  try {
    let advertisementsQuery = knex("Advertisement as ad")
      .join(
        "AdvertisementBidder as ab",
        "ad.advertisementId",
        "=",
        "ab.advertisementId"
      )
      .leftJoin("Users as schoolUser", "ad.schoolId", "=", "schoolUser.userId")
      .leftJoin(
        "Users as highestBidder",
        "ad.highestBidderId",
        "=",
        "highestBidder.userId"
      )
      .where("ab.businessId", businessId)
      .distinct("ad.advertisementId")
      .select(
        "ad.*",
        knex.raw(
          "CONCAT(schoolUser.userFirstName, ' ', schoolUser.userLastName) as schoolName"
        ),
        "highestBidder.userId as highestBidderId",
        "highestBidder.userFirstName as highestBidderFirstName",
        "highestBidder.userLastName as highestBidderLastName"
      )
      .orderBy("ad.creationDate", "desc");

    // Fetching all bids placed by the user on each ad
    const userBids = await advertisementsQuery;
    const advertisementsWithUserBids = await Promise.all(
      userBids.map(async (ad) => {
        const bids = await knex("AdvertisementBidder as ab")
          .where("ab.advertisementId", ad.advertisementId)
          .andWhere("ab.businessId", businessId)
          .select("ab.price", "ab.bidingDate")
          .orderBy("ab.bidingDate", "desc");

        return {
          ...ad,
          userBids: bids,
        };
      })
    );

    res.json(advertisementsWithUserBids);
  } catch (error) {
    console.error("Error fetching user's bid advertisements:", error);
    res.status(500).json({
      message: `Couldn't fetch advertisements with user bids: ${error.message}`,
    });
  }
});

router.delete("/remove/:bidId", async (req, res) => {
  const { bidId } = req.params;
  try {
    const bidToDelete = await knex("AdvertisementBidder")
      .select("advertisementId", "price")
      .where("advertisementBidderId", bidId)
      .first();
    if (!bidToDelete) {
      return res.status(404).json({ message: "Bid not found" });
    }

    await knex("AdvertisementBidder")
      .where("advertisementBidderId", bidId)
      .del();

    const currentHighestBid = await knex("Advertisement")
      .select("highestBiddingPrice")
      .where("advertisementId", bidToDelete.advertisementId)
      .first();

    if (currentHighestBid.highestBiddingPrice === bidToDelete.price) {
      // Find the next highest bid
      const nextHighestBid = await knex("AdvertisementBidder")
        .select("price", "businessId")
        .where("advertisementId", bidToDelete.advertisementId)
        .orderBy("price", "desc")
        .first();

      // update the record
      await knex("Advertisement")
        .where("advertisementId", bidToDelete.advertisementId)
        .update({
          highestBiddingPrice: nextHighestBid ? nextHighestBid.price : 0,
          highestBidderId: nextHighestBid ? nextHighestBid.businessId : null,
        });
      res.json({ success: true, message: "Bid removed successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: `Couldn't remove bid: ${error.message}` });
  }
});

module.exports = router;

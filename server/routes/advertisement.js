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
const multer = require("multer");
const authorise = require("../middleware/auth");

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const upload = multer({ storage: storage });

// Create a new advertisement
router.post(
  "/create",
  [authorise, upload.single("image")],
  async (req, res) => {
    const { schoolId, status, startingPrice, details, title } = req.body;

    const adPath = req.file ? req.file.path : null; // Handle the case where no file is uploaded

    try {
      const result = await knex("Advertisement").insert({
        schoolId,
        status,
        startingPrice,
        details,
        title,
        creationDate: knex.fn.now(),
        image: adPath,
      });

      const advertisementId = result[0];

      res.status(201).json({ success: true, advertisementId });
    } catch (error) {
      console.error("Error creating advertisement:", error);
      res.status(500).json({
        success: false,
        message: `Couldn't create the advertisement: ${error.message}`,
      });
    }
  }
);

// winner
router.post("/:advertisementId/selectWinner", async (req, res) => {
  const { advertisementId } = req.params;
  const { winnerId, bidPrice } = req.body;

  try {
    await knex("Advertisement")
      .where({ advertisementId: advertisementId })
      .update({
        highestBidderId: winnerId,
        highestBiddingPrice: bidPrice,
        status: "closed",
      });
    res.json({
      success: true,
      message: "Winner selected successfully and advertisement updated.",
    });
  } catch (error) {
    console.error("Error selecting the winner:", error);
    res.status(500).json({
      success: false,
      message: "Server error while selecting the winner.",
    });
  }
});

// check for closed bids and returns an array of related bidder details (a winner and the others).
router.get("/check-unsuccessful", async (req, res) => {
  try {
    const filteredAdvertisements = await knex("Advertisement")
      .select("advertisementId", "highestBidderId")
      .where({
        status: "closed",
        noti_sent: 0,
      })
      .andWhereRaw("highestBiddingPrice > startingPrice");

    if (filteredAdvertisements.length > 0) {
      const updatePromises = filteredAdvertisements.map((ad) =>
        knex("Advertisement")
          .where({ advertisementId: ad.advertisementId })
          .update({ noti_sent: 1 })
      );

      await Promise.all(updatePromises);
      const results = await Promise.all(
        filteredAdvertisements.map(async (ad) => {
          // Get unsuccessful bidder IDs
          const bidderIds = await knex("AdvertisementBidder")
            .select("businessId")
            .where({
              advertisementId: ad.advertisementId,
            })
            .andWhereNot({
              businessId: ad.highestBidderId,
            })
            .then((results) => results.map((bidder) => bidder.businessId));

          // Get highest bidder ID
          const highestBidderId = await knex("AdvertisementBidder")
            .select("businessId")
            .where({
              advertisementId: ad.advertisementId,
              businessId: ad.highestBidderId,
            })
            .first()
            .then((result) => (result ? result.businessId : null));

          return {
            advertisementId: ad.advertisementId,
            nonHighestBidderIds: [...new Set(bidderIds)],
            highestBidderId: highestBidderId,
          };
        })
      );

      res.json({ success: true, data: results });
    } else {
      res.json({
        success: true,
        data: [],
        message: "No advertisements found matching the criteria.",
      });
    }
  } catch (error) {
    console.error("Error filtering advertisements:", error);
    res.status(500).json({
      message: `Couldn't retrieve filtered advertisements: ${error.message}`,
    });
  }
});

// Update an existing advertisement
router.put(
  "/:advertisementId",
  [authorise, upload.single("image")],
  async (req, res) => {
    const { advertisementId } = req.params;
    const { title, startingPrice, details } = req.body;

    const adPath = req.file
      ? req.file.path
      : req.body.image
      ? req.body.image
      : null;
    try {
      await knex("Advertisement").where({ advertisementId }).update({
        title,
        startingPrice,
        details,
        image: adPath,
      });

      res.json({
        success: true,
        message: "Advertisement updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't update the advertisement: ${error.message}`,
      });
    }
  }
);

// Delete an advertisement
router.delete("/:advertisementId", async (req, res) => {
  const { advertisementId } = req.params;

  try {
    await knex("Advertisement").where({ advertisementId }).del();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: `Couldn't delete the advertisement: ${error.message}`,
    });
  }
});

// fetch single ad details
router.get("/:advertisementId/details", async (req, res) => {
  const { advertisementId } = req.params;

  try {
    // Fetch the advertisement details
    const advertisement = await knex("Advertisement")
      .join("Users as u", "Advertisement.schoolId", "=", "u.userId")
      .where("Advertisement.advertisementId", advertisementId)
      .select(
        "Advertisement.*",
        "u.userFirstName as schoolUserFirstName",
        "u.userLastName as schoolUserLastName",
        "u.school as schoolName",
        "u.avatar as schoolAvatar"
      )
      .first();

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    // Fetch all bids for this advertisement
    const bids = await knex("AdvertisementBidder")
      .join("Users", "AdvertisementBidder.businessId", "=", "Users.userId")
      .where("AdvertisementBidder.advertisementId", advertisementId)
      .select(
        "Users.userId",
        "Users.userFirstName",
        "Users.userLastName",
        "Users.avatar",
        "AdvertisementBidder.price",
        "AdvertisementBidder.advertisementBidderId",
        "AdvertisementBidder.bidingDate as bidDate"
      )
      .orderBy("AdvertisementBidder.price", "desc");

    let highestBidder = null;
    let winner = null;

    // Fetch the highest bidder if available
    if (advertisement.highestBidderId) {
      highestBidder = await knex("Users")
        .where("userId", advertisement.highestBidderId)
        .select("userId", "userFirstName", "userLastName", "avatar")
        .first();
    }

    // If the advertisement status is closed, set the winner to the highest bidder
    if (advertisement.status === "closed" && highestBidder) {
      winner = highestBidder;
    }

    res.json({
      advertisement,
      bids,
      highestBidder,
      winner,
    });
  } catch (error) {
    console.error("Error fetching advertisement details:", error);
    res.status(500).json({
      message: `Couldn't retrieve the advertisement details: ${error.message}`,
    });
  }
});

// Retrieves business IDs that have placed a bid on a specific advertisement when outbid
// excluding the current bidder's ID who is offering the highest amount.
router.get(
  "/:advertisementId/businesses-excluding-current",
  async (req, res) => {
    const { advertisementId } = req.params;
    const currentBidderId = req.query.currentBidderId;

    try {
      const bidders = await knex("AdvertisementBidder")
        .distinct("businessId")
        .where({
          advertisementId,
        })
        .andWhereNot({
          businessId: currentBidderId,
        });

      const businessIds = bidders.map((bidder) => bidder.businessId);

      res.json({ businessIds });
    } catch (error) {
      console.error("Error retrieving business IDs:", error);
      res.status(500).json({
        message: `Couldn't retrieve business IDs for advertisement ${advertisementId}: ${error.message}`,
      });
    }
  }
);

// highest bidder
router.get("/:advertisementId/highestBidder", async (req, res) => {
  const { advertisementId } = req.params;

  try {
    // First, get the highestBidderId from the advertisement table
    const advertisement = await knex("Advertisement")
      .select("highestBidderId")
      .where({ advertisementId })
      .first();

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found." });
    }

    // Then, use the highestBidderId to find the corresponding user
    const user = await knex("Users")
      .select("userFirstName", "userLastName")
      .where({ userId: advertisement.highestBidderId })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      success: true,
      data: {
        userFirstName: user.userFirstName,
        userLastName: user.userLastName,
      },
    });
  } catch (error) {
    console.error("Error fetching highest bidder details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching highest bidder details.",
    });
  }
});

// Retrieves business IDs that have placed a bid on a specific advertisement when outbid
// excluding the current bidder's ID who is offering the highest amount.
router.get(
  "/:advertisementId/businesses-excluding-current",
  async (req, res) => {
    const { advertisementId } = req.params;
    const currentBidderId = req.query.currentBidderId;

    try {
      const bidders = await knex("AdvertisementBidder")
        .select("businessId")
        .where({
          advertisementId,
        })
        .andWhereNot({
          businessId: currentBidderId,
        });

      const businessIds = bidders.map((bidder) => bidder.businessId);

      res.json({ businessIds });
    } catch (error) {
      console.error("Error retrieving business IDs:", error);
      res.status(500).json({
        message: `Couldn't retrieve business IDs for advertisement ${advertisementId}: ${error.message}`,
      });
    }
  }
);

// get all the ads
router.get("/", async (req, res) => {
  try {
    let advertisementsQuery = knex("Advertisement as ad")
      .leftJoin("Users as u", "ad.schoolId", "=", "u.userId")
      .leftJoin("Users as bidder", "ad.highestBidderId", "=", "bidder.userId")
      .leftJoin(
        knex("AdvertisementBidder as ab")
          .select("advertisementId")
          .distinct("businessId")
          .as("ab"),
        "ad.advertisementId",
        "=",
        "ab.advertisementId"
      )
      .groupBy(
        "ad.advertisementId",
        "u.school",
        "bidder.userId",
        "bidder.userFirstName",
        "bidder.userLastName"
      )
      .select(
        "ad.*",
        knex.raw("CONCAT(u.userFirstName, ' ', u.userLastName) as schoolName"),
        "bidder.userId as highestBidderId",
        "bidder.userFirstName as highestBidderFirstName",
        "bidder.userLastName as highestBidderLastName"
      )
      .count("ab.businessId as biddersCount");

    const advertisements = await advertisementsQuery;
    res.json(
      advertisements.map((ad) => ({
        ...ad,
        biddersCount: parseInt(ad.biddersCount, 10), // Ensure biddersCount is a number
        // Including highest bidder details in the response
        highestBidder: ad.highestBidderId
          ? {
              id: ad.highestBidderId,
              firstName: ad.highestBidderFirstName,
              lastName: ad.highestBidderLastName,
            }
          : null,
      }))
    );
  } catch (error) {
    console.error("Failed to retrieve advertisements:", error);
    res.status(500).json({
      message: `Couldn't retrieve advertisements: ${error.message}`,
    });
  }
});

router.get("/schoolName/:advertisementId", async (req, res) => {
  const { advertisementId } = req.params;

  try {
    const schoolName = await knex("Advertisement as ad")
      .leftJoin("Users as u", "ad.schoolId", "=", "u.userId")
      .select("u.school as schoolName")
      .where("ad.advertisementId", "=", advertisementId)
      .first();

    if (schoolName) {
      res.json(schoolName);
    } else {
      res.status(404).json({
        error: "School name not found for the provided advertisement ID.",
      });
    }
  } catch (error) {
    console.error("Error fetching school name:", error);
    res.status(500).json({
      message: `Couldn't fetch the school name: ${error.message}`,
    });
  }
});

// get all bidders for ad
router.get("/:advertisementId/bidders", async (req, res) => {
  const { advertisementId } = req.params;
  try {
    const bidders = await knex("AdvertisementBidder")
      .join("Users", "AdvertisementBidder.businessId", "=", "Users.userId")
      .where("AdvertisementBidder.advertisementId", advertisementId)
      .select(
        "Users.userId as businessId",
        "Users.userFirstName",
        "Users.userLastName",
        "AdvertisementBidder.price"
      );

    res.json(bidders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;

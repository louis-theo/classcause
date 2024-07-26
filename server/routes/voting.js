const express = require("express");
const authorise = require("../middleware/auth");
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

// add voted item
router.post("/", authorise, async (req, res) => {
  const { userId, wishlistItemId } = req.body;

  // check if exists
  const recordExists = await knex("VotedItem")
    .where({ wishlistItemId: wishlistItemId, userId: userId })
    .first();

  // error if exists
  if (recordExists) {
    return res.status(404).json({
      success: false,
      message: `Wishlist item ${wishlistItemId} for user ${userId} is already in voted.`,
    });
  }

  try {
    // Increment votingNum
    await knex("WishlistItem")
      .where({ wishlistItemId })
      .increment("votingNum", 1);

    const [votedItemId] = await knex("VotedItem").insert({
      userId,
      wishlistItemId,
    });

    res.status(201).json({
      success: true,
      message: `Item voted with id: ${votedItemId}`,
    });
  } catch (error) {
    res.status(500).json({ message: `Couldn't save item: ${error.message}` });
  }
});

// delete voted item
router.delete(
  "/delete/users/:userId/item/:wishlistItemId",
  authorise,
  async (req, res) => {
    const { wishlistItemId, userId } = req.params;
    try {
      // check if exists
      const recordExists = await knex("VotedItem")
        .where({ wishlistItemId: wishlistItemId, userId: userId })
        .first();

      // error if not
      if (!recordExists) {
        return res.status(404).json({
          success: false,
          message: `Wishlist item ${wishlistItemId} for user ${userId} not found in voted list.`,
        });
      }

      await knex("VotedItem")
        .where({ wishlistItemId: wishlistItemId, userId: userId })
        .del();

      // Decrement votingNum
      await knex("WishlistItem")
        .where({ wishlistItemId })
        .decrement("votingNum", 1);

      res.json({
        success: true,
        message: `Wishlist ${wishlistItemId} is removed from voted successfully`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't remove item from voted : ${error.message}`,
      });
    }
  }
);

module.exports = router;

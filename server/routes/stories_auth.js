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
    cb(null, "uploads/stories");
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

router.post(
  "/create",
  [authorise, upload.single("picture")],
  async (req, res) => {
    const { teacherId, storyName, storyDescription, wishlistItemId } = req.body;

    const imagePath = req.file ? req.file.path : null; // Handle the case where no file is uploaded

    try {
      // Check if the teacher exists
      const teacherExists = await knex("Users")
        .where({ userId: teacherId })
        .first();
      if (!teacherExists) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      // Check if the wishlist item is completed and does not have a story associated
      const wishlistItem = await knex("WishlistItem")
        .where({ wishlistItemId, status: "completed", storiesId: null })
        .first();
      if (!wishlistItem) {
        return res.status(400).json({
          success: false,
          message: "Invalid or already associated wishlist item.",
        });
      }

      // Insert the new story
      const [storyId] = await knex("Story")
        .insert({
          teacherId,
          storyName,
          storyDescription,
          picture: imagePath,
        })
        .returning("storyId");

      // Update the WishlistItem to link it with the created story
      await knex("WishlistItem")
        .where({ wishlistItemId })
        .update({ storiesId: storyId });

      res.status(201).json({ success: true, storyId });
    } catch (error) {
      console.error("Error inserting story:", error);
      res.status(500).json({
        success: false,
        message: `Couldn't create the story: ${error.message}`,
      });
    }
  }
);

// Update an existing story
router.put(
  "/:storyId",
  [authorise, upload.single("picture")],
  async (req, res) => {
    const { storyId } = req.params;
    const { storyName, storyDescription } = req.body;

    const storyPath = req.file
      ? req.file.path
      : req.body.picture
      ? req.body.picture
      : null;

    try {
      await knex("Story").where({ storyId: storyId }).update({
        storyName,
        picture: storyPath,
        storyDescription,
      });

      res.json({ success: true, message: "Story updated successfully" });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't update the story: ${error.message}`,
      });
    }
  }
);

// Delete a story - Only teachers and admins
router.delete(
  "/:storyId",
  authorise,

  async (req, res) => {
    const { storyId } = req.params;

    try {
      await knex("Story").where({ storyId }).del();

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: `Couldn't delete the story: ${error.message}`,
      });
    }
  }
);

// get single story
router.get("/:storyId", async (req, res) => {
  const { storyId } = req.params;

  try {
    const storyWithWishlistItemDetails = await knex("Story")
      .join("WishlistItem", "Story.storyId", "=", "WishlistItem.storiesId")
      .join("Users", "Story.teacherId", "=", "Users.userId")
      .where("Story.storyId", storyId)
      .select(
        "Story.*",
        "Users.userId as creatorId",
        "WishlistItem.wishlistItemId",
        "WishlistItem.name as wishlistItemName",
        "WishlistItem.code as wishlistItemCode",
        "WishlistItem.image as wishlistItemImage",
        "WishlistItem.goalValue as wishlistItemGoalValue",
        "WishlistItem.status as wishlistItemStatus",
        "WishlistItem.description as wishlistItemDescription",
        "WishlistItem.endDate as wishlistItemEndDate",
        "WishlistItem.currentValue as wishlistItemCurrentValue",

        knex.raw(
          "CONCAT(Users.userFirstName, ' ', Users.userLastName) as teacherName"
        )
      )
      .first();

    if (storyWithWishlistItemDetails) {
      res.json(storyWithWishlistItemDetails);
    } else {
      res.status(404).json({ message: "Story not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Couldn't retrieve the story and associated wishlist item details: ${error.message}`,
    });
  }
});

// get all the stories
router.get("/", async (req, res) => {
  try {
    const stories = await knex("Story")
      .join("WishlistItem", "Story.storyId", "=", "WishlistItem.storiesId")
      .join("Users", "Story.teacherId", "=", "Users.userId")
      .select(
        "Story.*",
        "Users.userId as creatorId",
        "WishlistItem.wishlistItemId",
        "WishlistItem.name as wishlistItemName",
        "WishlistItem.code as wishlistItemCode",
        "WishlistItem.image as wishlistItemImage",
        "WishlistItem.goalValue as wishlistItemGoalValue",
        "WishlistItem.status as wishlistItemStatus",
        "WishlistItem.description as wishlistItemDescription",
        "WishlistItem.endDate as wishlistItemEndDate",
        "WishlistItem.currentValue as wishlistItemCurrentValue"
      );

    res.json(
      stories.map((story) => ({
        ...story,
        wishlistItem: {
          wishlistItemId: story.wishlistItemId,
          name: story.wishlistItemName,
          code: story.wishlistItemCode,
          image: story.wishlistItemImage,
          goalValue: story.wishlistItemGoalValue,
          status: story.wishlistItemStatus,
          description: story.wishlistItemDescription,
          endDate: story.wishlistItemEndDate,
          currentValue: story.wishlistItemCurrentValue,
        },
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't retrieve stories: ${error.message}`,
    });
  }
});

// export
module.exports = router;

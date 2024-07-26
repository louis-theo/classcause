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
    cb(null, "uploads/items");
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

router.get("/eligible-for-story", async (req, res) => {
  const teacherId = req.query.teacherId;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required." });
  }

  try {
    const eligibleItems = await knex("WishlistItem")
      .where({
        teacherId: teacherId,
        status: "completed",
        storiesId: null,
      })
      .select("wishlistItemId", "name");

    res.json(eligibleItems);
  } catch (error) {
    console.error("Failed to fetch eligible wishlist items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create wishlist
router.post(
  "/create",
  [authorise, upload.single("image")],
  async (req, res) => {
    const {
      teacherId,
      parentId,
      name,
      goalValue,
      description,
      deadline,
      status,
      platformFulfillment,
      accountNumber,
      sortCode,
      link,
      code,
      accountHolderName,
    } = req.body;

    const imagePath = req.file ? req.file.path : null; // Handle the case where no file is uploaded

    try {
      // Insert new wishlist in DB
      const [wishlistItemId] = await knex("WishlistItem").insert({
        teacherId,
        parentId,
        name,
        goalValue,
        description,
        deadline,
        status,
        code,
        link,
        platformFulfillment,
        image: imagePath,
      });

      res.status(201).json({ success: true, wishlistItemId: wishlistItemId });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: `Couldn't create wishlist: ${error.message}` });
    }
  }
);

// Update wishlist
router.put(
  "/:wishlistId",

  [authorise, upload.single("image")],
  async (req, res) => {
    const wishlistItemId = req.params.wishlistId;
    const {
      teacherId,
      parentId,
      name,
      goalValue,
      description,
      deadline,
      status,
      platformFulfillment,
    } = req.body;

    const imagePath = req.file
      ? req.file.path
      : req.body.image
      ? req.body.image
      : null;

    try {
      const updatedFields = {
        teacherId,
        parentId,
        name,
        goalValue,
        description,
        deadline,
        status,
        platformFulfillment,
        image: imagePath,
      };

      // Update the wishlist item
      await knex("WishlistItem")
        .where({ wishlistItemId })
        .update(updatedFields);

      res.status(200).json({
        success: true,
        message: `Wishlist item ${wishlistItemId} updated successfully`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Couldn't update wishlist item: ${error.message}`,
      });
    }
  }
);

// Delete wishlist
router.delete("/:wishlistId", authorise, async (req, res) => {
  const wishlistId = req.params.wishlistId;

  try {
    // Delete donations associated with the wishlist
    await knex("Donation").where({ wishlistId: wishlistId }).del();

    // Delete the wishlist item
    await knex("WishlistItem").where({ wishlistItemId: wishlistId }).del();

    res.json({
      success: true,
      message: `Wishlist ${wishlistId} deleted successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Couldn't delete wishlist: ${error.message}` });
  }
});

// Fetch single wishlist info
router.get("/item/:wishlistId", async (req, res) => {
  const { wishlistId } = req.params;

  try {
    const wishlist = await knex("WishlistItem")
      .leftJoin("Users as Parent", "WishlistItem.parentId", "Parent.userId")
      .join("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .select(
        "WishlistItem.*",
        knex.raw(
          "COALESCE(CONCAT(Parent.userFirstName, ' ', Parent.userLastName), 'No Parent') as parentName"
        ),
        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      )
      .where({ wishlistItemId: wishlistId })
      .first();

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist item not found." });
    }

    res.json(wishlist);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Couldn't fetch wishlist: ${error.message}` });
  }
});

// Fetch all wishlists for user
router.get("/:teacherId", async (req, res) => {
  const { teacherId } = req.params;

  try {
    const wishlists = await knex("WishlistItem")
      .where({ teacherId: teacherId })
      .leftJoin("Users as Parent", "WishlistItem.parentId", "Parent.userId")
      .leftJoin("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .select(
        "WishlistItem.*",

        knex.raw(
          "COALESCE(CONCAT(Parent.userFirstName, ' ', Parent.userLastName), 'No Parent') as parentName"
        ),
        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      );

    res.status(200).json(wishlists);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Couldn't fetch wishlists: ${error.message}` });
  }
});

// update the underfunded status
router.patch("/:itemId", authorise, async (req, res) => {
  const { itemId } = req.params;
  const { status, isUnderfunded } = req.body;

  // validation
  if (status === undefined && isUnderfunded === undefined) {
    return res.status(400).json({
      message: "Please provide a new status and/or isUnderfunded value.",
    });
  }

  const updateData = {};
  if (status !== undefined) updateData.status = status;
  if (isUnderfunded !== undefined) updateData.isUnderfunded = isUnderfunded;
  updateData.endDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    // update
    const updatedRows = await knex("WishlistItem")
      .where({ wishlistItemId: itemId })
      .update(updateData);

    if (updatedRows) {
      res.status(200).json({
        success: true,
        message: "Wishlist item updated successfully.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Wishlist item not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update wishlist item." });
  }
});

// mark withdrawn
router.patch("/:wishlistItemId/markWithdrawn", authorise, async (req, res) => {
  const { wishlistItemId } = req.params;

  try {
    const updatedRows = await knex("WishlistItem")
      .where({ wishlistItemId })
      .update({
        isMoneyWithdrawn: true,
        withdrawalDate: knex.fn.now(),
      });

    if (updatedRows) {
      res.status(200).json({
        success: true,
        message: "Money withdrawal marked successfully.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Wishlist item not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update wishlist item." });
  }
});

// mark bought
router.patch("/:wishlistItemId/markBought", authorise, async (req, res) => {
  const { wishlistItemId } = req.params;

  try {
    const updatedRows = await knex("WishlistItem")
      .where({ wishlistItemId })
      .update({
        isItemBought: true,
        purchaseDate: knex.fn.now(),
      });

    if (updatedRows) {
      res.status(200).json({
        success: true,
        message: "Item marked as bought successfully.",
      });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Wishlist item not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update wishlist item." });
  }
});

// Fetch total withdrawal amount for a teacher
router.get("/withdrawal-amount", async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required." });
  }

  try {
    const totalWithdrawalAmount = await knex("WishlistItem")
      .where({
        teacherId: teacherId,
        status: "completed",
        platformFulfillment: 0,
        fundsTransferred: 0,
      })
      .sum("currentValue as total")
      .first();

    res.json({ totalWithdrawalAmount: totalWithdrawalAmount.total || 0 });
  } catch (error) {
    console.error("Failed to fetch withdrawal amount:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

module.exports = router;

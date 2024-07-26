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

// get all the items with platform fulfillment
router.get("/items/platform", async (req, res) => {
  try {
    const platformItems = await knex("WishlistItem")
      .where({ platformFulfillment: 1, status: "completed" })
      .leftJoin("Users as Parent", "WishlistItem.parentId", "Parent.userId")
      .leftJoin("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .select(
        "WishlistItem.teacherId",
        "WishlistItem.categoryId",
        "WishlistItem.currentValue",
        "WishlistItem.code",
        "WishlistItem.deadline",
        "WishlistItem.dispatchDate",
        "WishlistItem.description",
        "WishlistItem.endDate",
        "WishlistItem.goalValue",
        "WishlistItem.image",
        "WishlistItem.name",
        "WishlistItem.parentId",
        "WishlistItem.isDispatched",
        "WishlistItem.platformFulfillment",
        "WishlistItem.status",
        "WishlistItem.storiesId",
        "WishlistItem.wishlistItemId",
        knex.raw(
          "COALESCE(CONCAT(Parent.userFirstName, ' ', Parent.userLastName), 'No Parent') as parentName"
        ),
        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      );

    res.status(200).json(platformItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch completed wishlists for admin: ${error.message}`,
    });
  }
});

// get all sent items (maybe for filtering?)
router.get("/items/sent", async (req, res) => {
  try {
    const sentItems = await knex("WishlistItem")
      .where({ platformFulfillment: 1, isDispatched: 1 })
      .leftJoin("Users as Parent", "WishlistItem.parentId", "Parent.userId")
      .leftJoin("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .select(
        "WishlistItem.teacherId",
        "WishlistItem.categoryId",
        "WishlistItem.currentValue",
        "WishlistItem.deadline",
        "WishlistItem.description",
        "WishlistItem.endDate",
        "WishlistItem.goalValue",
        "WishlistItem.dispatchDate",
        "WishlistItem.image",
        "WishlistItem.name",
        "WishlistItem.parentId",
        "WishlistItem.isDispatched",
        "WishlistItem.platformFulfillment",
        "WishlistItem.status",
        "WishlistItem.storiesId",
        "WishlistItem.wishlistItemId",
        knex.raw(
          "COALESCE(CONCAT(Parent.userFirstName, ' ', Parent.userLastName), 'No Parent') as parentName"
        ),
        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      );

    res.status(200).json(sentItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch dispatched wishlists: ${error.message}`,
    });
  }
});

// change dispatch status - need to send 1(true) or 0(false) in req body
router.patch("/items/:itemId/dispatchStatus", async (req, res) => {
  const { itemId } = req.params;
  const { isDispatched: isDispatched, dispatchDate: dispatchDate } = req.body;

  try {
    // Update the dispatched status in the database
    await knex("WishlistItem")
      .where({ wishlistItemId: itemId })
      .update({ isDispatched, dispatchDate });

    res.json({
      success: true,
      message: "Dispatch status updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `An error occurred while updating the dispatch status: ${error}`,
    });
  }
});

// fetch single dispatch item
router.get("/items/:itemId", async (req, res) => {
  const { itemId } = req.params;

  try {
    const itemDetails = await knex("WishlistItem")
      .join("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .select(
        "WishlistItem.*",
        "Teacher.email",
        "Address.street",
        "Address.city",
        "Address.postcode",

        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      )

      .leftJoin("Address", "Teacher.addressId", "=", "Address.addressId")
      .where("WishlistItem.wishlistItemId", itemId)
      .first();

    if (!itemDetails) {
      return res.status(404).json({ message: "Item not found" });
    }

    itemDetails.fullAddress = `${itemDetails.street}, ${itemDetails.city}, ${itemDetails.postcode}`;

    res.json(itemDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching item details" });
  }
});

module.exports = router;

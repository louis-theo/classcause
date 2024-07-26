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

// Fetch all active wishlists for discover page
router.get("/active-items", async (req, res) => {
  try {
    const activeWishlists = await knex("WishlistItem")
      .where({ status: "active" })
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

    res.status(200).json(activeWishlists);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Couldn't fetch active wishlists: ${error.message}` });
  }
});

// Fetch all the teachers and schools
router.get("/teachers", async (req, res) => {
  try {
    const userSummaries = await knex("Users")
      .select(
        "Users.userId",
        "Users.accountType",
        "Users.avatar",
        knex.raw(
          "CONCAT(Users.userFirstName, ' ', Users.userLastName) AS name"
        ),
        "Users.school",
        "Address.postcode",
        knex.raw(
          "COUNT(DISTINCT CASE WHEN WishlistItem.status = 'active' THEN WishlistItem.wishlistItemId END) AS activeItems"
        ),
        knex.raw(
          "COUNT(DISTINCT CASE WHEN WishlistItem.status = 'completed' THEN WishlistItem.wishlistItemId END) AS completedItems"
        ),
        knex.raw("COUNT(DISTINCT Advertisement.advertisementId) AS numberOfAds")
      )
      .where(function () {
        this.where("Users.accountType", "teacher").orWhere(
          "Users.accountType",
          "school"
        );
      })
      .leftJoin("Address", "Users.addressId", "Address.addressId")
      .leftJoin("WishlistItem", "Users.userId", "WishlistItem.teacherId")
      .leftJoin("Advertisement", "Users.userId", "Advertisement.schoolId")
      .groupBy("Users.userId", "Address.postcode")
      .orderBy("Users.userId");

    res.json(userSummaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching user summaries",
      error: error.toString(),
    });
  }
});

module.exports = router;

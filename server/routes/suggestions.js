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
const authorise = require("../middleware/auth");

// Fetch all wishlists for user
router.get("/:userId", authorise, async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlists = await knex("WishlistItem")
      .where({ parentId: userId })
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

module.exports = router;

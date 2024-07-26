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

// get all the favourite items and  all the card  info  per user
router.get("/users/:userId/items", async (req, res) => {
  const { userId } = req.params;

  try {
    const favouriteItems = await knex("FavouriteItem")
      .join(
        "WishlistItem",
        "FavouriteItem.wishlistItemId",
        "WishlistItem.wishlistItemId"
      )
      .leftJoin("Users as Parent", "WishlistItem.parentId", "Parent.userId")
      .leftJoin("Users as Teacher", "WishlistItem.teacherId", "Teacher.userId")
      .where("FavouriteItem.userId", userId)
      .select(
        "WishlistItem.teacherId",
        "WishlistItem.categoryId",
        "WishlistItem.currentValue",
        "WishlistItem.code",
        "WishlistItem.deadline",
        "WishlistItem.description",
        "WishlistItem.endDate",
        "WishlistItem.goalValue",
        "WishlistItem.image",
        "WishlistItem.name",
        "WishlistItem.parentId",
        "WishlistItem.platformFulfillment",
        "WishlistItem.status",
        "WishlistItem.storiesId",
        "WishlistItem.votingNum",
        "WishlistItem.wishlistItemId",
        knex.raw(
          "COALESCE(CONCAT(Parent.userFirstName, ' ', Parent.userLastName), 'No Parent') as parentName"
        ),
        knex.raw(
          "CONCAT(Teacher.userFirstName, ' ', Teacher.userLastName) as teacherName"
        )
      );

    // Respond with the fetched data
    res.status(200).json({
      message: "Favourite items fetched successfully.",
      data: favouriteItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch favourite wishlists: ${error.message}`,
    });
  }
});

// get all the favourite classrooms and all the card info per user
router.get("/users/:userId/classrooms", async (req, res) => {
  const { userId } = req.params;

  try {
    const savedClassrooms = await knex("FavouriteClassroom")
      .where("FavouriteClassroom.userId", userId)
      .join("Users", "FavouriteClassroom.classroomId", "Users.userId")
      .leftJoin("Address", "Users.addressId", "Address.addressId")
      .leftJoin("WishlistItem", "Users.userId", "WishlistItem.teacherId")
      .leftJoin("Advertisement", "Users.userId", "Advertisement.schoolId")
      .select(
        "Users.userId",
        "Users.avatar",
        "Users.accountType",
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
      .groupBy("Users.userId", "Address.postcode")
      .orderBy("Users.userId");

    res.status(200).json({
      message: "Saved classrooms fetched successfully.",
      data: savedClassrooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch saved classrooms: ${error.message}`,
    });
  }
});

// get just the array of favourite items ids
router.get("/users/:userId/itemList", async (req, res) => {
  const { userId } = req.params;

  //   id check
  if (!userId || isNaN(userId) || parseInt(userId, 10) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing userId",
    });
  }

  try {
    const items = await knex("FavouriteItem")
      .select("WishlistItemId")
      .where("UserId", userId);

    const itemIdList = items.map((item) => item.WishlistItemId);

    res.status(200).json({
      success: true,
      itemIdList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch list of saved item ids: ${error.message}`,
    });
  }
});

// get just the array of favourite classrooms ids
router.get("/users/:userId/classroomList", async (req, res) => {
  const { userId } = req.params;
  //   id check
  if (!userId || isNaN(userId) || parseInt(userId, 10) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing userId",
    });
  }
  try {
    const classrooms = await knex("FavouriteClassroom")
      .select("classroomId")
      .where("userId", userId);

    const classroomIdList = classrooms.map((item) => item.classroomId);

    res.status(200).json({
      success: true,
      classroomIdList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Couldn't fetch list of saved classrooms ids: ${error.message}`,
    });
  }
});

// add favourite item
router.post("/save/item", authorise, async (req, res) => {
  const { userId, wishlistItemId } = req.body;

  // check if exists
  const recordExists = await knex("FavouriteItem")
    .where({ wishlistItemId: wishlistItemId, userId: userId })
    .first();

  // error if exists
  if (recordExists) {
    return res.status(404).json({
      success: false,
      message: `Wishlist item ${wishlistItemId} for user ${userId} is already in favourites.`,
    });
  }

  try {
    const [favouriteItemId] = await knex("FavouriteItem").insert({
      userId,
      wishlistItemId,
    });
    res.status(201).json({
      success: true,
      message: `Item saved with id: ${favouriteItemId}`,
    });
  } catch (error) {
    res.status(500).json({ message: `Couldn't save item: ${error.message}` });
  }
});

// add favourite school
router.post("/save/classroom", authorise, async (req, res) => {
  const { userId, classroomId } = req.body;

  try {
    // check if exists
    const recordExists = await knex("FavouriteClassroom")
      .where({ classroomId: classroomId, userId: userId })
      .first();

    // error if does
    if (recordExists) {
      return res.status(404).json({
        success: false,
        message: `Classroom ${classroomId} for user ${userId} is already in favourites.`,
      });
    }
    const [favouriteClassroomId] = await knex("FavouriteClassroom").insert({
      userId,
      classroomId,
    });
    res.status(201).json({
      success: true,
      message: `Classroom saved with id: ${favouriteClassroomId}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Couldn't save classroom: ${error.message}` });
  }
});

// delete fav item
router.delete(
  "/delete/users/:userId/item/:wishlistItemId",
  authorise,
  async (req, res) => {
    const { wishlistItemId, userId } = req.params;
    try {
      // check if exists
      const recordExists = await knex("FavouriteItem")
        .where({ wishlistItemId: wishlistItemId, userId: userId })
        .first();

      // error if not
      if (!recordExists) {
        return res.status(404).json({
          success: false,
          message: `Wishlist item ${wishlistItemId} for user ${userId} not found in favourites.`,
        });
      }

      await knex("FavouriteItem")
        .where({ wishlistItemId: wishlistItemId, userId: userId })
        .del();

      res.json({
        success: true,
        message: `Wishlist ${wishlistItemId} is removed from favourites successfully`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't remove item from favourites : ${error.message}`,
      });
    }
  }
);

// delete fav school
router.delete(
  "/delete/users/:userId/classroom/:classroomId",
  authorise,
  async (req, res) => {
    const { classroomId, userId } = req.params;
    try {
      // check if exists
      const recordExists = await knex("FavouriteClassroom")
        .where({ classroomId: classroomId, userId: userId })
        .first();

      // error if not
      if (!recordExists) {
        return res.status(404).json({
          success: false,
          message: `Classroom ${classroomId} for user ${userId} not found in favourites.`,
        });
      }

      await knex("FavouriteClassroom")
        .where({ classroomId: classroomId, userId: userId })
        .del();

      res.json({
        success: true,
        message: `Classroom ${classroomId} is removed from favourites successfully`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Couldn't remove classroom from favourites : ${error.message}`,
      });
    }
  }
);

//get parent userIds that favourite this classroom
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const favouriteClassrooms = await knex("FavouriteClassroom")
      .where("classroomId", userId)
      .select("userId");

    if (favouriteClassrooms.length === 0) {
      return res
        .status(404)
        .json({ message: "No favourite classrooms found." });
    }

    res.json(favouriteClassrooms);
  } catch (error) {
    console.error("Failed to fetch favourite classrooms:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

module.exports = router;

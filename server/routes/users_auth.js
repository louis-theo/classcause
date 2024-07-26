const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);
require("dotenv").config();
const authorise = require("../middleware/auth");
const crypto = require("crypto");
const multer = require("multer");
const SALT_ROUNDS = 8; // to encrypt

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
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

// create new user
router.post("/register", upload.single("avatar"), (req, res) => {
  const {
    userFirstName,
    email,
    mobileNum,
    password,
    userLastName,
    accountType,
    groupName,
    school,
    street,
    city,
    postcode,
    orderCompletion,
    bio,
  } = req.body;

  // Encrypt the password the user provided via bcrypt
  bcrypt.hash(password, SALT_ROUNDS, async (err, hashedPassword) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Couldn't encrypt the supplied password" });
    }
    const avatarPath = req.file ? req.file.path : null; // Handle the case where no file is uploaded

    try {
      // Create a user record in the database
      const user = await knex("Users").where({ email: email }).first();
      if (user) {
        return res.status(500).json({ message: "User already exists" });
      }

      // Insert address first and get the addressId
      const [addressId] = await knex("Address").insert({
        street,
        city,
        postcode,
      });

      // Insert user information with the obtained addressId
      const [userId] = await knex("Users").insert({
        userFirstName,
        email,
        mobileNum,
        password,
        userLastName,
        accountType,
        groupName,
        school,
        orderCompletion,
        password: hashedPassword,
        addressId: addressId,
        avatar: avatarPath,
        bio,
      });

      res.json({ success: true, userId: userId });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: `Couldn't create a new user: ${error}`,
      });
    }
  });
});

// login - get user details and let them in
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database for the user via email address
    const user = await knex("Users").where({ email: email }).first();

    // Ensure the password provided matches the encrypted password
    bcrypt.compare(password, user.password, function (_, success) {
      if (!success) {
        return res
          .status(403)
          .json({ message: "Username/Password combination is incorrect" });
      }

      // Generate a JWT token for the user
      const token = jwt.sign(
        {
          id: user.userId,
          sub: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      // And send it back to the frontend
      res.status(200).json({ authToken: token });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "User not found" });
  }
});

// get the full user info
router.get("/profile", authorise, async (req, res) => {
  const userId = req.token.id;

  try {
    // Query the database for the user by comparing the ID in the JWT token against the ID of the user
    const userProfile = await knex("Users")
      .select("Users.*", "Address.*", "Users.stripeAccountId")
      .leftJoin("Address", "Users.addressId", "Address.addressId")
      .where({ "Users.userId": userId })
      .first();

    // Remove user password before sending it to client side
    delete userProfile.password;
    // Fetch the list of favorite classrooms
    const favoriteClassrooms = await knex("FavouriteClassroom")
      .select("classroomId")
      .where("userId", userId);

    // Extract classroom IDs
    const favoriteClassroomIds = favoriteClassrooms.map(
      (item) => item.classroomId
    );

    // Fetch the list of favorite items
    const favoriteItems = await knex("FavouriteItem")
      .select("wishlistItemId")
      .where("UserId", userId);

    // Extract item IDs
    const favoriteItemIds = favoriteItems.map((item) => item.wishlistItemId);

    // Fetch the list of voted suggestions
    const votedSuggestions = await knex("VotedItem")
      .select("wishlistItemId")
      .where("userId", userId);

    // see if there are any pending suggesions
    if (userProfile.accountType === "parent") {
      const suggestionsWithoutTargetPrice = await knex("WishlistItem")
        .where({ parentId: userId, goalValue: null })
        .first();
      userProfile.suggestionsWithoutTargetPrice = suggestionsWithoutTargetPrice;
    }

    const votedItemsIds = votedSuggestions.map((item) => item.wishlistItemId);

    // Append the lists of favorites to the user profile object
    userProfile.favoriteClassrooms = favoriteClassroomIds;
    userProfile.favoriteItems = favoriteItemIds;
    userProfile.votedSuggestions = votedItemsIds;

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't fetch user profile", error: error });
  }
});

// get profile to view
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await knex("Users").where({ userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Query the database for the user by comparing the ID in the JWT token against the ID of the user
    const userProfile = await knex("Users")
      .select("Users.*", "Address.*", "Users.stripeAccountId")
      .leftJoin("Address", "Users.addressId", "Address.addressId")

      .where({ "Users.userId": userId })
      .first();

    // Remove user password before sending it to client side (via the `delete` operator)
    delete userProfile.password;

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't fetch user profile", error: error });
  }
});

// update profile
router.put(
  "/profile",
  [authorise, upload.single("avatar")],
  async (req, res) => {
    const userId = req.token.id;

    const {
      userFirstName,
      email,
      mobileNum,
      password,
      userLastName,
      groupName,
      school,
      street,
      city,
      postcode,
      orderCompletion,
      bio,
    } = req.body;

    const avatarPath = req.file ? req.file.path.replace(/\\/g, "/") : null;

    try {
      const user = await knex("Users").where({ userId: userId }).first();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update Address if provided
      if (street || city || postcode) {
        await knex("Address")
          .where({ addressId: user.addressId })
          .update({
            street: street || user.street,
            city: city || user.city,
            postcode: postcode || user.postcode,
          });
      }

      // Encrypt the password the user provided via bcrypt
      // If password is provided, hash it
      let hashedPassword = user.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      }

      const updateFields = {
        userFirstName: userFirstName || user.userFirstName,
        userLastName: userLastName || user.userLastName,
        email: email || user.email,
        mobileNum: mobileNum || user.mobileNum,
        groupName: groupName || user.groupName,
        school: school || user.school,
        password: hashedPassword || user.password,
        orderCompletion: orderCompletion || user.orderCompletion,
        bio: bio || user.bio,
      };

      if (avatarPath) {
        updateFields.avatar = avatarPath;
      }

      // Update User Information
      await knex("Users").where({ userId }).update(updateFields);

      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      res
        .status(500)
        .json({ message: "Failed to update profile", error: error });
    }
  }
);

// delete profile
router.delete("/profile", authorise, async (req, res) => {
  const userId = req.token.id;
  const transaction = await knex.transaction();

  try {
    // Check if the user exists
    const user = await knex("Users").where({ userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For Teachers or Schools: Check for active items or financial obligations
    if (user.accountType === "teacher" || user.accountType === "school") {
      const activeOrFinancialObligations = await knex("WishlistItem")
        .where(function () {
          this.where({ teacherId: userId }).andWhere(function () {
            this.where({ status: "active" }).orWhere({
              isMoneyWithdrawn: false,
              isItemBought: false,
              platformFulfillment: true,
            });
          });
        })
        .first();

      if (activeOrFinancialObligations) {
        return res.status(400).json({
          message:
            "You cannot delete your profile because you have active items or items with pending financial transactions.",
        });
      }
    }

    // Delete donations records made by the user
    await knex("Donation").where({ userId }).del();

    // Delete wishlist items added by the user apart from suggestions from parents
    if (user.accountType !== "parent") {
      await knex("WishlistItem").where({ teacherId: userId }).del();
    }

    // Delete stories added by the user
    await knex("Story").where({ teacherId: userId }).del(); // Delete stories added by the user

    // Delete the user's address
    await knex("Address").where({ addressId: user.addressId }).del();

    // Delete the user's profile
    await knex("Users").where({ userId }).del();
    await transaction.commit();
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Failed to delete profile:", error);
    res.status(500).json({ message: "Failed to delete profile", error: error });
  }
});

// get user's first and last name
router.get("/name/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await knex("Users")
      .select("userFirstName", "userLastName")
      .where({ userId: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user name", error: error });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await knex("Users").where({ email }).first();
    if (!user) {
      return res.status(404).json({ message: "Email does not exist." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await knex("Users").where({ email }).update({
      resetPasswordToken: hashedToken,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `To reset your password, please click on this link: ${resetUrl}`;

    const sendEmail = async (emailData) => {
      try {
        const response = await fetch(
          `${process.env.BACKEND_URL}/email/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          }
        );

        const data = await response.json();
        console.log("Email send response:", data);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };
    sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res.json({ message: "Email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending the email." });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await knex("Users")
      .where({
        resetPasswordToken: hashedToken,
      })
      .first();

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await knex("Users").where({ userId: user.userId }).update({
      password: hashedPassword,
      resetPasswordToken: null,
    });

    res.json({ message: "Password has been reset." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting the password." });
  }
});

//Get the email address of a specific user
router.get("/email/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await knex("Users")
      .select("email")
      .where({ userId: userId })
      .first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ email: user.email });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to fetch user email", error: error });
  }
});

// export
module.exports = router;

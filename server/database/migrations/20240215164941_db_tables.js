/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  //ADDRESS TABLE
  return (
    knex.schema
      .createTable("Address", (table) => {
        table.increments("addressId").primary();
        table.string("street", 50);
        table.string("city", 50);
        table.string("postcode", 50);
      })

      // Users table
      .createTable("Users", (table) => {
        table.increments("userId").primary();
        table.string("userFirstName", 50);
        table.string("email", 40).unique();
        table.string("mobileNum", 16);
        table.string("avatar");
        table.string("password", 255);
        table.string("userLastName", 50);
        table.string("accountType", 20);
        table.string("groupName", 50);
        table.string("school", 50);
        table.string("bio");
        table.string("orderCompletion", 50);
        table.string("resetPasswordToken");
        table
          .integer("addressId")
          .unsigned()
          .references("addressId")
          .inTable("Address")
          .onDelete("CASCADE");

        table.string("stripeAccountId").nullable();
      })
      // Categories table - not in use but may be helpful in future work
      .createTable("Categories", (table) => {
        table.increments("categoryId").primary();
        table.string("categoryName", 40);
      })
      // Stories table
      .createTable("Story", (table) => {
        table.increments("storyId").primary();
        table
          .integer("teacherId")
          .unsigned()
          .references("userId")
          .inTable("Users");
        table.string("storyName", 500);
        table.string("picture");
        table.text("storyDescription", 500);
      })
      // WishlistItem table
      .createTable("WishlistItem", (table) => {
        table.increments("wishlistItemId").primary();
        table
          .integer("teacherId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("parentId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("storiesId")
          .unsigned()
          .nullable()
          .references("storyId")
          .inTable("Story")
          .onDelete("SET NULL");
        table
          .integer("categoryId")
          .unsigned()
          .references("categoryId")
          .inTable("Categories")
          .onDelete("CASCADE");
        table.string("name", 50);
        table.string("code", 6);
        table.string("image");
        table.string("link");
        table.timestamp("creationTime").defaultTo(knex.fn.now());
        table.decimal("goalValue", 10, 2);
        table.timestamp("deadline");
        table.integer("votingNum").defaultTo(0);
        table.string("status", 50);
        table.boolean("isUnderfunded");
        table.timestamp("endDate");
        table.text("description");
        table.boolean("platformFulfillment");
        table.boolean("isDispatched").defaultTo(false);
        table.timestamp("dispatchDate");
        table.decimal("currentValue", 10, 2);
        table.boolean("isMoneyWithdrawn").defaultTo(false);
        table.timestamp("withdrawalDate");
        table.boolean("isItemBought").defaultTo(false);
        table.timestamp("purchaseDate");
        table.boolean("fundsTransferred").defaultTo(false);
        table.integer("Noti_sent").defaultTo(0);
      })

      // favourite items tables
      .createTable("FavouriteItem", (table) => {
        table.increments("favouriteItemId").primary();
        table
          .integer("userId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("wishlistItemId")
          .unsigned()
          .references("wishlistItemId")
          .inTable("WishlistItem")
          .onDelete("CASCADE");
      })

      // favourite classroom tables
      .createTable("FavouriteClassroom", (table) => {
        table.increments("favouriteClassroomId").primary();
        table
          .integer("userId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("classroomId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
      })

      // voted items tables
      .createTable("VotedItem", (table) => {
        table.increments("votedItemId").primary();
        table
          .integer("userId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("wishlistItemId")
          .unsigned()
          .references("wishlistItemId")
          .inTable("WishlistItem")
          .onDelete("CASCADE");
      })

      // Donation table
      .createTable("Donation", (table) => {
        table.increments("donateId").primary();
        table
          .integer("userId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("wishlistId")
          .unsigned()
          .references("wishlistItemId")
          .inTable("WishlistItem")
          .onDelete("CASCADE");
        table.decimal("donationAmount", 9, 2);
        table.timestamp("donationTime").defaultTo(knex.fn.now());
      })
      // transaction table
      .createTable("TransactionFee", (table) => {
        table.increments("transactionFeeId").primary();
        table.string("accountType", 20); //no dependency on payment or donation table?
        table.decimal("transactionRate", 6, 2);
        table.timestamp("timeStamp").defaultTo(knex.fn.now());
      })

      //transaction fee history table

      .createTable("FeeHistory", (table) => {
        table.increments("id").primary();
        table.string("accountType", 20).notNullable();
        table.decimal("transactionRate", 6, 2).notNullable();
        table.timestamp("updateTime").defaultTo(knex.fn.now());
      })

      // ad table
      .createTable("Advertisement", (table) => {
        table.increments("advertisementId").primary();
        table
          .integer("schoolId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table
          .integer("highestBidderId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .defaultTo(null)
          .onDelete("SET NULL");
        table.string("image");
        table.string("status", 20);
        table.decimal("startingPrice", 6, 2);
        table.decimal("highestBiddingPrice", 6, 2);
        table.text("details");
        table.text("title");
        table.timestamp("creationDate");
        table.integer("Noti_sent").defaultTo(0);
      })
      // add bidder table -
      .createTable("AdvertisementBidder", (table) => {
        table.increments("advertisementBidderId").primary();
        table
          .integer("advertisementId")
          .unsigned()
          .references("advertisementId")
          .inTable("Advertisement")
          .onDelete("CASCADE");
        table
          .integer("businessID")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table.decimal("price", 6, 2);
        table.timestamp("bidingDate");
      })
      // Notification table
      .createTable("Notification", (table) => {
        table.increments("notificationId").primary();
        table
          .integer("userId")
          .unsigned()
          .references("userId")
          .inTable("Users")
          .onDelete("CASCADE");
        table.text("content");
        table.integer("status");
        table.timestamp("time").defaultTo(knex.fn.now());
        table.string("title", 255);
        table.integer("messageId").unsigned();
        table.integer("senderId").unsigned();
        table.text("URL");
      })

      // Message table
      .createTable("Message", (table) => {
        table.increments("messageId").primary();
        table.text("messageContent");
        table.text("messageTitle");
      })
  );
};

// need to drop tables in reverse order - to not to have foreign key contraints error
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("Message")
    .dropTableIfExists("Notification")
    .dropTableIfExists("AdvertisementBidder")
    .dropTableIfExists("Advertisement")
    .dropTableIfExists("Donation")
    .dropTableIfExists("VotedItem") // TO DO: make dummy data
    .dropTableIfExists("FavouriteClassroom") // TO DO: make dummy data
    .dropTableIfExists("FavouriteItem") // TO DO: make dummy data
    .dropTableIfExists("WishlistItem")
    .dropTableIfExists("Story")
    .dropTableIfExists("Categories") //????/ delete?
    .dropTableIfExists("FeeHistory")
    .dropTableIfExists("Users")
    .dropTableIfExists("TransactionFee")
    .dropTableIfExists("Address");
};

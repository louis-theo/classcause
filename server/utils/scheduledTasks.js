const cron = require("node-cron");
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);
const updateItemStatusTask = () => {
  cron.schedule("0 0 * * *", async () => {
    // schedule the task to run daily at midnight
    console.log(
      "Running a daily check for wishlist items past their deadline..."
    );
    const today = new Date();

    // finding items whose deadline has passed and are not yet marked as completed
    const itemsToUpdate = await knex("WishlistItem")
      .where("deadline", "<", today)
      .andWhere({ status: "active" })
      .select("wishlistItemId");

    // Update each item found by the query
    await Promise.all(
      itemsToUpdate.map(async (item) => {
        await knex("WishlistItem")
          .where({ wishlistItemId: item.wishlistItemId })
          .update({
            status: "undefunded",
            isUnderfunded: true,
          });
      })
    );

    console.log(`Updated ${itemsToUpdate.length} items.`);
  });
};

module.exports = {
  updateItemStatusTask,
};

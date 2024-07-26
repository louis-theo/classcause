  // favourite items tables
  /*.createTable("FavouriteItem", (table) => {
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
  })*/

  //dummy data assumptions;  only parent users, only actve, completed and underfunded - no suggestions
  // users: 5, 6,10,18,
  // itemId: any but 13 - up to 14
  const favouriteItem=[

    {
        userId: 5,
        wishlistItemId: 10
        
    },
    {
        userId: 6,
        wishlistItemId: 12
    },
    {
        userId: 10,
        wishlistItemId: 11
    },
    {
        userId: 5,
        wishlistItemId: 9
        
    },
    {
        userId: 6,
        wishlistItemId: 9
    },
    {
        userId: 18,
        wishlistItemId: 7
    },
    {
        userId: 5,
        wishlistItemId: 10
        
    },
    {
        userId: 6,
        wishlistItemId: 5
    },
    {
        userId: 10,
        wishlistItemId: 10
    },
    {
        userId: 18,
        wishlistItemId: 2
        
    },
    {
        userId: 6,
        wishlistItemId: 10
    },
    {
        userId: 10,
        wishlistItemId: 4
    },

  ];
module.exports = favouriteItem;
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
router.get("/", async (req, res) => {
  const { userId, searchTerm } = req.query;

  try {
    const notificationsQuery = knex("Notification")
      .leftJoin("Users", "Notification.senderId", "=", "Users.userId")
      .where("Notification.userId", userId)
      .orderBy("Notification.status", "asc")
      .orderBy("Notification.time", "desc");

    if (searchTerm) {
      const notifications = await notificationsQuery
        .join(
          "Message as messageUnread",
          "Notification.messageId",
          "=",
          "messageUnread.messageId"
        )
        .where(function () {
          this.where(
            "messageUnread.messageTitle",
            "like",
            `%${searchTerm}%`
          ).orWhere("messageUnread.messageContent", "like", `%${searchTerm}%`);
        })

        .select(
          "Notification.*",
          "messageUnread.messageTitle",
          "messageUnread.messageContent",
          "Users.userFirstName as senderFirstName",
          "Users.userLastName as senderLastName",
          "Notification.url"
        );

      res.json(notifications);
    } else {
      const allNotifications = await notificationsQuery
        .join(
          "Message as messageAll",
          "Notification.messageId",
          "=",
          "messageAll.messageId"
        )

        .select(
          "Notification.*",
          "messageAll.messageTitle",
          "messageAll.messageContent",
          "Users.userFirstName as senderFirstName",
          "Users.userLastName as senderLastName",
          "Notification.url"
        );

      res.json(allNotifications);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Route to update notification status
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await knex("Notification").where("NotificationId", id).update({ status });

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Route to get unread notification count for a specific user
router.get("/unreadCount", async (req, res) => {
  const { userId } = req.query;

  try {
    const unreadCount = await knex("Notification")
      .where("userId", userId)
      .where("status", 0)
      .count("NotificationId as unreadCount")
      .first();

    res.json(unreadCount.unreadCount);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// add a new notification
router.post("/add", async (req, res) => {
  const { userId, messageId, status, url } = req.body;

  const senderId = req.body.senderId;
  try {
    const notificationData = {
      userId,
      messageId,
      status,
      time: knex.fn.now(),
      url,
    };

    if (senderId) {
      notificationData.senderId = senderId;
    }
    const newNotification = await knex("Notification").insert(notificationData);

    res.json(newNotification);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;

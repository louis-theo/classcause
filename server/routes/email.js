require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // because env variables are strings
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email sending route
router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    let info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
    });

    console.log("Message sent: %s", info.messageId);
    res.send({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, message: "Failed to send email" });
  }
});

//get specific message data
router.get("/messages/:messageId", async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await knex("Message").where("messageId", messageId).first();
    if (message) {
      res.json(message);
    } else {
      res.status(404).json({ message: "Message not found" });
    }
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ message: "Failed to fetch message", error });
  }
});

module.exports = router;

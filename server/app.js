require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwtSecret = process.env.JWT_SECRET;
// for deployment
const path = require("path");

// require (import) routes - for the http requests
const userAuth = require("./routes/users_auth");
const storiesRouter = require("./routes/stories_auth");
const wishlists = require("./routes/wishlists");
const advertisementRouter = require("./routes/advertisement");
const schoolRouter = require("./routes/school");
const teacherMetricsRouter = require("./routes/teacher_metrics");
const parentMetricsRouter = require("./routes/parent_metrics");
const generalMetricsRouter = require("./routes/general_metrics");
const adBidsRouter = require("./routes/bids");
const transactionFeeRouter = require("./routes/transaction_fee");
const donationsRouter = require("./routes/donations");
const stripeRouter = require("./routes/stripe");
const stripeWebhookRouter = require("./routes/stripe_webhook");
const favouriteRouter = require("./routes/favourites");
const dispatchItems = require("./routes/dispatch_items");
const EmailRouter = require("./routes/email");
const notificationsRoute = require("./routes/notification");
const voteSuggestions = require("./routes/voting");
const suggestionsRouter = require("./routes/suggestions");
const discoverRouter = require("./routes/discover");

// connect to front-end - please do not change
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(cors({ origin: FRONTEND_URL }));

app.use(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookRouter
);

// enabling transfer of the right format between front and back
app.use(express.json());

// image handling
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// creating folders on the server
const fs = require("fs");

// uploads folder
const uploadsDir = path.join(__dirname, "uploads");

// subdirectories
const subdirs = ["avatars", "stories", "items", "ads"];

// chack if exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created.");
}

// check sub if exists
subdirs.forEach((subdir) => {
  const subdirPath = path.join(uploadsDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
    console.log(`${subdir} directory created.`);
  }
});

// change status of underfunded tasks
const { updateItemStatusTask } = require("./utils/scheduledTasks");
// Start the scheduled task
updateItemStatusTask();

// REQUETSS: test connection with get request - using routes
app.use("/users", userAuth);
app.use("/discover", discoverRouter);
app.use("/favourites", favouriteRouter);
app.use("/wishlists", wishlists);
app.use("/success-stories", storiesRouter);
app.use("/advertisement", advertisementRouter);
app.use("/school", schoolRouter);
app.use("/teachermetrics", teacherMetricsRouter);
app.use("/parent-metrics", parentMetricsRouter);
app.use("/generalmetrics", generalMetricsRouter);
app.use("/bids", adBidsRouter);
app.use("/transaction-fee", transactionFeeRouter);
app.use("/donations", donationsRouter);
app.use("/api", stripeRouter);
app.use("/dispatch", dispatchItems);
app.use("/email", EmailRouter);
app.use("/notification", notificationsRoute);
app.use("/vote", voteSuggestions);
app.use("/suggestions", suggestionsRouter);

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Export the app
module.exports = app;

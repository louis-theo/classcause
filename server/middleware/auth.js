require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const authorise = (req, res, next) => {
  // If the client didn't send an `authorization` token, they are unauthorised
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Authentication is required" });
  }

  // The client will send the JWT token as part of the `authorization` header like so "Bearer ABC123"
  // So split that string by a space and get the JWT token (the second part)
  const token = req.headers.authorization.split(" ")[1];

  // Check the provided JWT is correct for the given user
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "The authentication token is invalid" });
    }

    req.token = decodedToken;

    // Move on to the next request!
    next();
  });
};

module.exports = authorise;

const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Generates a JWT token for testing.
 * @param {Object} payload - The payload to encode in the JWT.
 * @param {string} secret - The secret key to sign the token.
 * @param {Object} options - Additional JWT options, like expiresIn.
 * @returns {string} - A JWT token.
 */

export const generateTestToken = (
  payload = {},
  secret = process.env.JWT_SECRET,
  options = { expiresIn: "1h" }
) => {
  const defaultPayload = {
    id: 1,
    role: "teacher",
    ...payload,
  };

  return jwt.sign(defaultPayload, secret, options);
};

"use strict";

const path = require("path");

// This is a custom Jest transformer turning file imports into filenames.
// Adapted for Jest 28+ requirements for code transformers.

module.exports = {
  process(src, filename) {
    const basename = path.basename(filename);
    return {
      code: `module.exports = ${JSON.stringify(basename)};`,
    };
  },
};

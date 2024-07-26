/** @type {import('jest').Config} */
const config = {
  //   transform: {
  //     "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "babel-jest",
  //     "^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
  //     "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)":
  //       "<rootDir>/config/jest/fileTransform.js",
  //   },
  testEnvironment: "jsdom",
  transform: {
    // "^.+\\.(ts|tsx|js)$": "babel-jest",
    "^.+\\.(css)$": "<rootDir>/fileTransform.js",
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transformIgnorePatterns: ["/node_modules/(?!swiper|ssr-window|dom7)"],
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/fileTransform.js",
    "\\.(svg|jpg|png)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
};

module.exports = config;

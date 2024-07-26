module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-react", // This ensures JSX is transformed
  ],
  plugins: ["@babel/plugin-syntax-jsx"],
};

const path = require("path");

module.exports = {
  entry: "./dist/render/index.js",
  output: {
    path: path.join(__dirname, "/dist/render"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js"],
  },
  mode: "development", //development / production
};

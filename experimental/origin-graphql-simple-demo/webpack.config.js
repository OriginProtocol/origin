var path = require("path");
var webpack = require("webpack");

const isProduction = process.env.NODE_ENV === "production";

var config = {
  target: "web",
  entry: {
    app: "./src/index.js"
  },
  devtool: false,
  output: {
    filename: "app.js",
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      { test: /\.flow$/, loader: "ignore-loader" },
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/origin-utils")
        ],
        loader: "babel-loader"
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      }
    ]
  },
  resolve: {
    extensions: [".js", ".json"]
  },
  node: {
    fs: "empty"
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : "development",
  plugins: []
};

module.exports = config;

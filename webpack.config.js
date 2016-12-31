var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var UglifyJsPlugin = require('webpack-uglify-js-plugin');

var cssnext = require('postcss-cssnext');
var nested = require('postcss-nested');
var doiuse = require('doiuse');
var wordwrap = require('wordwrap');

var colors = require('colors');

let sassExtract = new ExtractTextPlugin('styles/miller.css');
let webpackPlugins = [
  sassExtract,
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new CopyWebpackPlugin([
    {
      context: 'src',
      from: '**/*.html',
      to: '.'
    }
  ])
];

if (process.env.NODE_ENV === 'production') {
  webpackPlugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      dead_code: true,
      drop_debugger: true,
      drop_console: true
    },
    comments: false
  }));
}

module.exports = {
  entry: {
    app: ['./src/app.js', 'webpack-hot-middleware/client'],
    miller: ['./src/miller.js', 'webpack-hot-middleware/client']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.scss$/,
        loader: sassExtract.extract("css!sass")
      },
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.resolve(__dirname, '../'),
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  eslint: {
    formatter: require('eslint-friendly-formatter')
  },
  plugins: webpackPlugins,
};
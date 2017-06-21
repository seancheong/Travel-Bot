'use strict';

const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const WebpackNotifierPlugin = require('webpack-notifier');

// Extract info from package.json
const packageInfo = require('./package.json');
const appName = packageInfo.name;

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    [appName]: ['babel-polyfill', './src/index.js']
  },

  output: {
    path: __dirname + '/build',
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            failOnWarning: true,
            failOnError: true
          }
        }
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                'targets': {
                  'node': 'current'
                }
              }], 'stage-1'
            ]
          }
        }
      }
    ]
  },

  plugins: [
    new WebpackNotifierPlugin({ title: appName })
  ]
};

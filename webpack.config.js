require('dotenv').config();

const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const assetPath = '/assets/';

const baseConfiguration = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, `${assetPath}`),
  entry: {
    global: [`./js/scripts.js`, `./scss/style.scss`],
  },
  output: {
    filename: 'scripts.min.js',
    path: path.join(__dirname, `${assetPath}dist`, '/js')
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `../css/style.min.css`
    }),
    new OptimizeCSSAssetsPlugin(),
    new webpack.DefinePlugin({
      STRIPE_PUBLISHABLE_KEY: JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY),
      STRIPE_SECRET_KEY: JSON.stringify(process.env.STRIPE_SECRET_KEY),
      LAMBDA_ENDPOINT: JSON.stringify(process.env.LAMBDA_ENDPOINT),
      COFFEE_PRICING: JSON.stringify({
        commuter: 1800,
        woodsman: 1800,
        dark_horse: 1800
      })
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [path.join(__dirname, '/node_modules')]
            }
          }
        ]
      },
      {
        test: /\.js$/,
        include: /(js)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '../fonts/'
          }
        }]
      }
    ]
  },
  externals: {
    Stripe: "Stripe"
  }
};

module.exports = baseConfiguration;

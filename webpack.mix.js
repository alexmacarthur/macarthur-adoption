require('dotenv').config();
const webpack = require('webpack');
const mix = require('laravel-mix');
const BabiliPlugin = require('babili-webpack-plugin');

/*
 |--------------------------------------------------------------------------
 | Custom Webpack Config
 |--------------------------------------------------------------------------
 */

mix.webpackConfig({
  plugins: [
    new BabiliPlugin(),
    new webpack.DefinePlugin({
      STRIPE_PUBLISHABLE_KEY: JSON.stringify(process.env.STRIPE_PUBLISHABLE_KEY),
      STRIPE_SECRET_KEY: JSON.stringify(process.env.STRIPE_SECRET_KEY),
      LAMBDA_ENDPOINT: JSON.stringify(process.env.LAMBDA_ENDPOINT),
      COFFEE_PRICING: JSON.stringify({
        commuter: 1600,
        woodsman: 1600,
        darkhorse: 1600
      })
    })
  ],
  externals: {
    Stripe: "Stripe"
  }
});

/*
 |--------------------------------------------------------------------------
 | Custom Mix Options
 |--------------------------------------------------------------------------
 */

mix.options({
  uglify: false
});

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 */

mix
  .js('assets/js/scripts.js', 'assets/js/scripts.min.js')
  .sass('assets/scss/style.scss', 'assets/css/style.min.css');

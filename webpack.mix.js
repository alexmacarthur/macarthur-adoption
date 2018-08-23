require('dotenv').config();

const mix = require('laravel-mix');
const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');

/*
 |--------------------------------------------------------------------------
 | Custom Webpack Config
 |--------------------------------------------------------------------------
 */

mix.webpackConfig({
  plugins: [
    new BabiliPlugin()
  ]
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

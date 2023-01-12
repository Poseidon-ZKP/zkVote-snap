import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path, { resolve } from 'path';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import WebpackBarPlugin from 'webpackbar';
var webpack = require('webpack');


const webpackConfig = {
  // entry: './src/index.ts',
  entry: './dist/bundle.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      type: 'commonjs2'
    },
  },
  resolve: {
      fallback: {
          buffer: require.resolve('buffer/'),
      },
  },
  plugins: [
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
      }),
  ],
};

export default webpackConfig;

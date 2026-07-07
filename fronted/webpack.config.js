const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash:8].js' : 'bundle.js',
      chunkFilename: isProduction ? '[name].[contenthash:8].js' : '[name].bundle.js',
      publicPath: '/',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[hash:8][ext]',
          },
        },
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(
          Object.fromEntries(
            Object.entries(process.env).filter(([key]) => key.startsWith('REACT_APP_'))
          )
        )
      }),
      ...(isProduction ? [new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
      })] : []),
    ],
    devServer: {
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      port: 3001,
      open: true,
    }
  };
};

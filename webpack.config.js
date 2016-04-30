const webpack = require('webpack');

const { NODE_ENV } = process.env;
const plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
];

if (NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false,
      },
    })
  );
}

module.exports = {
  plugins,
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  output: {
    library: 'Redux Undo Immutable',
    libraryTarget: 'umd',
  },
  externals: [
    'immutable',
  ],
};

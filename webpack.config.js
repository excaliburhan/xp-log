// const webpack = require('webpack')
const path = require('path')
const glob = require('glob')

const getEntries = function (globPath) {
  let ret = {}
  const files = glob.sync(globPath)
  files.forEach(pathname => {
    const arr = pathname.split('/')
    let name = arr[arr.length - 1]
    name = name.substring(0, name.length - 3)
    ret[name] = './' + pathname
  })
  return ret
}

let entries = getEntries('src/*.js')

module.exports = {
  entry: entries,
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /(\.js$)/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     unused: false,
    //     warnings: false
    //   },
    //   output: { comments: false }
    // })
  ]
}

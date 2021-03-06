import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import postcssNext from 'postcss-cssnext';
import postcssImport from 'postcss-import';
import postcssExtend from 'postcss-extend';
import postcssReporter from 'postcss-reporter';
import StyleLintPlugin from 'stylelint-webpack-plugin';
import HtmlWebpackExcludeAssetsPlugin from 'html-webpack-exclude-assets-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const PATHS = {
  src: path.join(__dirname, 'src'),
  js: path.join(__dirname, 'src/js'),
  static: path.join(__dirname, 'src/static'),
  views: path.join(__dirname, 'src/pug/views'),
  dist: path.join(__dirname, 'dist'),
};

const extractStyles = new ExtractTextPlugin({ filename: 'css/[name].css' });

const supportedBrowsers = [
  '> 0.5%',
  'last 2 versions',
  'not ie <= 10'
];

const postcssProcessors = [
  postcssImport,
  postcssExtend,
  postcssNext({ browsers: supportedBrowsers }),
  postcssReporter({ clearReportedMessages: true }),
];

const scssProcessors = [
  autoprefixer({
    browsers: supportedBrowsers,
    cascade: false
  }),
  postcssReporter({ clearReportedMessages: true }),
];

module.exports = env => {
  const stylesType = process.env.STYLES; // postcss or scss
  const stylesExtension = stylesType === 'scss' ? '.scss' : '.css';

  return {
    context: path.resolve(__dirname, 'src'),

    entry: {
      main: './app.js',
      dashboard: './dashboard.js',
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js'
    },

    watch: false,

    devtool: false,

    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src/js'),
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                plugins: ['transform-runtime']
              }
            },
            {
              loader: 'eslint-loader',
              options: {
                cache: true,
                emitWarning: true,
                configFile: '.eslintrc'
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: extractStyles.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: 'inline',
                  plugins: (loader) => postcssProcessors,
                }
              }
            ],
            publicPath: '../'
          })
        },
        {
          test: /\.scss$/,
          use: extractStyles.extract({
            use: [
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: 'inline',
                  plugins: (loader) => scssProcessors
                }
              },
              {
                loader: "sass-loader",
                options: {
                  sourceMap: true
                }
              }
            ],
            publicPath: '../'
          })
        },
        {
          test: /\.pug$/,
          use: [
            'html-loader',
            {
              loader: 'pug-html-loader',
              options: {
                exports: false
              }
            }
          ]
        },
        {
          test: /.*\.(gif|png|jpe?g|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'my_assets/[name].[ext]'
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {
                progressive: true,
                pngquant: {
                  quality: '75-90',
                  speed: 4
                },
                mozjpeg: {
                  quality: 75
                },
                gifsicle: {
                  interlaced: true
                }
              }
            }
          ]
        },
        {
          test: /\.(woff2?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/[name].[ext]'
              }
            }
          ]
        },
      ]
    },

    plugins: [
      new webpack.DefinePlugin({
        LANG: JSON.stringify('en'),
        RECAPTCHA_KEY: JSON.stringify('6LehUz8UAAAAAAsd3PdAh6mYg5gWdGVfcw7_PSI0')
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'common'
      }),

      new HtmlWebpackPlugin({
        template: 'pug/index.pug',
        excludeAssets: [/dashboard\.(css|js)/],
        minify: false
      }),

      new HtmlWebpackPlugin({
        filename: 'dashboard/login/index.html',
        template: path.resolve(PATHS.views, 'dashboard/login.pug'),
        minify: false
      }),

      new HtmlWebpackPlugin({
        filename: 'dashboard/registration/index.html',
        template: path.resolve(PATHS.views, 'dashboard/registration.pug'),
        minify: false
      }),

      new HtmlWebpackPlugin({
        filename: 'dashboard/profile/index.html',
        template: path.resolve(PATHS.views, 'dashboard/profile.pug'),
        minify: false
      }),

      new HtmlWebpackExcludeAssetsPlugin(),

      extractStyles,

      new CopyWebpackPlugin([
        {
          from: PATHS.static,
          to: PATHS.dist
        }
      ]),

      new StyleLintPlugin({
        configFile: '.stylelintrc',
        context: 'src/' + stylesType,
        files: '**/*' + stylesExtension,
        failOnError: false,
        quiet: true,
      }),
    ],
  }
};

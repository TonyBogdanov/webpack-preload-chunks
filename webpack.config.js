'use strict';

const os = require( 'os' );
const path = require( 'path' );

const TerserPlugin = require( 'terser-webpack-plugin' );
const WebpackPreloadChunksPlugin = require( path.resolve( __dirname, 'src/plugin.es6' ) );

const options = ( entry, outputFilename, outputPath, outputUrl, preload ) => ( {

    entry: entry,

    resolve: {

        extensions: [ '.es6', '.js' ],

    },

    output: {

        filename: outputFilename,
        chunkFilename: '[contenthash].js',

        path: outputPath,
        publicPath: outputUrl,

    },

    plugins: preload ? [ new WebpackPreloadChunksPlugin( {

        swPath: 'sw.js',

    } ) ] : [],

    optimization: {

        minimizer: [ new TerserPlugin( {

            parallel: os.cpus().length,
            terserOptions: {

                compress: true,
                mangle: true,

                output: {

                    comments: false,

                },

            },

        } ) ],

    },

} );

module.exports = [

    options(

        path.resolve( __dirname, 'src/sw.es6' ),
        'sw.js',
        path.resolve( __dirname, 'example' ),
        './',
        false

    ),

    options(

        path.resolve( __dirname, 'example/index.es6' ),
        'with-preloading.js',
        path.resolve( __dirname, 'example/build' ),
        './build/',
        true

    ),

    options(

        path.resolve( __dirname, 'example/index.es6' ),
        'without-preloading.js',
        path.resolve( __dirname, 'example/build' ),
        './build/',
        false

    ),

];

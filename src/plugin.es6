const path = require( 'path' );
const fs = require( 'fs' );

const InjectPlugin = require( 'webpack-inject-plugin' ).default;

module.exports = class WebpackPreloadChunksPlugin {

    validateOptionsChunkListName( value ) {

        if ( 'string' !== typeof value ) {

            throw `${ this.constructor.name }.options.chunkListName must be a valid string.`;

        }

        value = value.replace( /^\s+/, '' ).replace( /\s+$/, '' );
        if ( 0 === value.length ) {

            throw `${ this.constructor.name }.options.chunkListName cannot be empty.`;

        }

        return value;

    }

    validateOptionsSWPath( value ) {

        if ( 'string' !== typeof value ) {

            throw `${ this.constructor.name }.options.swPath must be a valid string.`;

        }

        value = value.replace( /^\s+/, '' ).replace( /\s+$/, '' );
        if ( 0 === value.length ) {

            throw `${ this.constructor.name }.options.swPath cannot be empty.`;

        }

        return value;

    }

    validateOptions( options ) {

        if ( null === options || 'object' !== typeof options ) {

            throw `${ this.constructor.name }.options must be a valid object.`;

        }

        const valid = {};

        if ( options.hasOwnProperty( 'chunkListName' ) ) {

            valid.chunkListName = this.validateOptionsChunkListName( options.chunkListName );
            delete options.chunkListName;

        } else {

            valid.chunkListName = 'webpack.chunks.json';

        }

        if ( options.hasOwnProperty( 'swPath' ) ) {

            valid.swPath = this.validateOptionsSWPath( options.swPath );
            delete options.swPath;

        } else {

            valid.swPath = 'sw.js';

        }

        if ( 0 < Object.keys( options ) ) {

            throw `Invalid ${ this.constructor.name }.options, unknown extra keys: ${
                Object.keys( options ).join( ', ' ) }.`;

        }

        return valid;

    }

    computeOutputUrl( compiler ) {

        let url = ( compiler.options.output.publicPath || '' ).replace( /\/$/, '' );
        return 0 < url.length ? `${ url }/` : url;

    }

    computeChunkListPath( compiler ) {

        return path.resolve( compiler.options.output.path, this.options.chunkListName );

    }

    computeChunkListUrl( outputUrl ) {

        return outputUrl + this.options.chunkListName;

    }

    computePreloadCode( chunkListUrl, swUrl ) {

        return fs.readFileSync( path.resolve( __dirname, 'preload.es6' ), { encoding: 'utf8' } )
                 .replace( /\/\*\s*WEBPACK_CHUNKS_PATH\s*\*\//g, chunkListUrl )
                 .replace( /\/\*\s*WEBPACK_SW_PATH\s*\*\//g, swUrl );

    }

    constructor( options = {} ) {

        this.options = this.validateOptions( options );

    }

    apply( compiler ) {

        const outputUrl = this.computeOutputUrl( compiler );

        const chunkListPath = this.computeChunkListPath( compiler );
        const chunkListUrl = this.computeChunkListUrl( outputUrl );

        const chunks = [];

        ( new InjectPlugin( () => this.computePreloadCode( chunkListUrl, this.options.swPath ) ) ).apply( compiler );

        compiler.hooks.assetEmitted.tap( this.constructor.name, file => {

            if ( file === compiler.options.output.filename ) {

                return;

            }

            chunks.push( outputUrl + file );

        } );

        compiler.hooks.done.tap( this.constructor.name, () => {

            fs.writeFileSync( chunkListPath, JSON.stringify( chunks ) );

        } );

    }

};

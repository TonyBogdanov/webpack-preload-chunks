import { networkIdleCallback } from 'network-idle-callback';

const loaded = window.__webpackPreloadedChunks = window.__webpackPreloadedChunks || [];
const queue = [];

let processing = false;

const register = async () => {

    if ( ! ( 'serviceWorker' in navigator ) ) {

        return false;

    }

    const resolve = async () => {

        const registration = await navigator.serviceWorker.getRegistration();
        if ( registration ) {

            return registration;

        }

        return await resolve();

    };

    navigator.serviceWorker.register( '/* WEBPACK_SW_PATH */' );
    return await resolve();

};

const process = () => {

    if ( processing || 0 === queue.length ) {

        return;

    }

    processing = true;
    const chunk = queue.shift();

    const script = document.createElement( 'script' );
    script.src = chunk;

    document.head.appendChild( script );

    networkIdleCallback( () => {

        processing = false;
        process();

    }, { timeout: 60000 } );

};

const enqueue = async path => {

    ( await ( await fetch( path ) ).json() ).forEach( chunk => {

        if ( -1 < loaded.indexOf( chunk ) ) {

            return;

        }

        loaded.push( chunk );
        queue.push( chunk );

        process();

    } );

};

( async () => {

    if ( ! ( await register() ) ) {

        return;

    }

    await enqueue( '/* WEBPACK_CHUNKS_PATH */' );

} )();

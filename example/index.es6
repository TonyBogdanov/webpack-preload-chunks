const chunks = [ 'alpha', 'beta', 'gamma', 'delta', 'epsilon' ];

const stats = {};
const log = document.getElementById( 'log' );

const test = async id => {

    stats[ id ] = {

        started: new Date(),
        executed: null,

    };

    table();

    ( await import( './test/' + id + '.es6' ) ).default();
    table();

};

const cell = text => {

    var td = document.createElement( 'td' );
    td.innerText = text;

    return td;

};

const table = () => {

    log.innerHTML = '';

    chunks.forEach( chunk => {

        const row = document.createElement( 'tr' );
        row.appendChild( cell( chunk ) );

        if ( ! stats.hasOwnProperty( chunk ) ) {

            row.appendChild( cell( '-' ) );
            row.appendChild( cell( '-' ) );
            row.appendChild( cell( '-' ) );

            log.appendChild( row );
            return;

        }
        
        row.appendChild( cell( stats[ chunk ].started.toISOString() ) );
        row.appendChild( cell( stats[ chunk ].executed ? stats[ chunk ].executed.toISOString() : '-' ) );

        row.appendChild( cell( stats[ chunk ].executed ?
            ( stats[ chunk ].executed.getTime() - stats[ chunk ].started.getTime() ) + ' ms' : '-' ) );

        log.appendChild( row );

    } );

};

const start = () => chunks.forEach( test );

window.execute = id => {

    stats[ id ].executed = new Date();
    table();

};

document.getElementById( 'start' ).addEventListener( 'click', function () {

    if ( this.disabled ) {

        return;

    }

    this.disabled = true;
    start();

} );

table();

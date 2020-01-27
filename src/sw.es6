import 'network-idle-callback/lib/request-monitor';

self.addEventListener( 'fetch', e => {

    self.requestMonitor.listen( e );
    e.respondWith( fetch( e.request ).then( response => {

        self.requestMonitor.unlisten( e );
        return response;

    }, e => self.requestMonitor.unlisten( e ) ) );

} );

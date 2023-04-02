self.messenger = (function( ) {

    const routes = { };

    function deleteRoute(name) {
        self.removeEventListener('message', routes[name]);
        delete routes[name];
    }

    return {
        send: function(type, content, ...transferables) {
            if(content instanceof Object) content = JSON.stringify(content);
            self.postMessage({type: type, content}, [].concat.apply([], transferables.flat( )));
        },

        setRoute: function(route_name, method) {
            if(routes[route_name]) deleteRoute(route_name);
            self.addEventListener('message', method);
            routes[route_name] = method;
        },

        removeRoute: function(route_name) {
            deleteRoute(route_name);
        }
    }

});

messenger.setRoute('load-scripts', function(message) {
    self.importScripts(...message.data.flat( ));
});

importScripts('./graphics_compile.js', './graphics_cache.js');


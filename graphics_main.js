
self.messenger = (function( ) {

    const routes = { };

    function deleteRoute(name) {
        self.removeEventListener('message', routes[name]);
        delete routes[name];
    }

    return {
        send: function(type, content, transferables) {
            if(content instanceof Object) content = JSON.stringify(content);
            self.postMessage({type: type, content}, transferables);
        },

        setRoute: function(route_name, method) {
            if(routes[route_name]) deleteRoute(route_name);
            const wrapper = async function(message) {
                if(message.data.type != route_name) return;
                const result = await method(message.data.content);
                if(result) messenger.send(route_name, result, [result]);
                else messenger.send(route_name);
            }
            self.addEventListener('message', wrapper);
            routes[route_name] = wrapper;
        },

        removeRoute: function(route_name) {
            deleteRoute(route_name);
        }
    }

})( );

self.GL_Engine = { };

GL_Engine.buffers = (function( ) {

    const cache = { };

    return {
        create: function(key, data, usage = 'STATIC_DRAW') {
            const buffer = gl.createBuffer( );
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl[usage]);
            cache[key] = buffer;
        },

        destroy: function(key) {
            delete cache[key];
        },
        
        pull: function(key) {
            return cache[key];
        }
    }

})( );

messenger.setRoute('init', async function(message) {
    const config = await fetch(new URL(message.shader_uri, message.base_uri)).then(res => res.json( ));
    self.gl = message.canvas.getContext('webgl', {premultipliedAlpha: false});
    GL_Engine.base_uri = message.base_uri;
    await GL_Engine.compile(config);
    GL_Engine.buffers.create('square', [0, 0, 1, 0, 0, 1, 1, 1]);
});

messenger.setRoute('fill', function(color) {
    if(!gl) return notInitialized( );
    gl.clearColor(...color);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
});

messenger.setRoute('load-scripts', function(message) {
    self.importScripts(...message.data.content.flat( ));
});

function notInitialized( ) {
    console.error('graphics not initialized');
}


importScripts('./glmatrix-min.js','./graphics_compile.js', './graphics_cache.js');


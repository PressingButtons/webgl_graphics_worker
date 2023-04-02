const worker = new Worker(new URL('graphics_main.js', import.meta.url), {name: 'webgl_graphics_worker'});
const Graphics = { };

const sendMessage = function(message_type, message_content, ...message_transferables) {
    if(message_transferables.length == 0) message_transferables = [];
    else message_transferables = [].concat.apply([], message_transferables);
    worker.postMessage({type: message_type, content: message_content}, message_transferables)
}

const sendPromisedMessage = function(message_type, message_content, message_transferables) {
    return new Promise(function(resolve, reject) {
        //create a new message listener to key on messages that match message_type
        function promiseMessageListener(message) {
            if(message.data.type != message_type) return;
            worker.removeEventListener(promiseMessageListener); //unbind listener
            resolve(message.data); 
        }
        worker.addEventListener('message', promiseMessageListener);
        GraphicsWorker.sendMessage(message_type, message_content, message_transferables);
    });
}

/**
 * Graphics Fill
 * =============
 * Fills the canvas with the specified number
 * @param {Float32Array} color
 */
Graphics.fill = function(color) {
    return sendMessage('fill', color, [color]);
}

/**
 * cacheTexture 
 * ============
 * Sends a loaded image's bitmap data
 * @param {HTMLImageElement} image 
 * @returns Promise
 */
Graphics.cacheTexture = function(image) {
    const bitmap = createImageBitmap(image)
    return sendPromisedMessage('cache-texture', bitmap, [bitmap]);
}

/**
 * loadTexture
 * ===========
 * Sends a path to be loaded on the worker side and converted into a texture
 * @param {String} image_url 
 * @returns null
 */
Graphics.loadTexture = function(image_url) {
    return sendPromisedMessage('load-texture', image_url);
}

/**
 * render
 * ======
 * Receives an object detailing render instructions
 * @param {Object} object 
 * @returns null
 */
Graphics.render = function(object) {
    return sendMessage('render-object', object);
}

export default Graphics;
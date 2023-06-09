
{
    const textures = {cache: { }};

    textures.cacheFromBitmap = function(key, bitmap) {
        this.cache[key] = this.createTexture(gl, bitmap);
    }

    textures.cacheFromURL = function(key, url) {
        return fetch(new URL(url, GL_Engine.base)).then(res => res.blob( )).then(bitmap => this.cacheFromBitmap(key, bitmap));
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {HTMLImageElement} image
     * @returns Object
     */
    textures.createTexture = function(gl, image) {
        const texture = gl.createTexture( );
        //check to see if number is a power of 2 - used to check if mipmaps are possible
        const powerOf2 = n => { return (n & (n - 1) == 0)}
        //otherwise use this to configure image onto texture
        const setTextureParamaters = ( ) => {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.bindTexture(texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if(powerOf2(image.width) && powerOf2(image.height))  gl.generateMipMap(gl.TEXTURE_2D);
        else setTextureParamaters(gl, texture);
        return {
            texture: texture, 
            width: image.width, 
            height: image.height, 
            i_width: 1 / image.width, 
            i_height: 1 / image.height
        }
    }

    GL_Engine.textures = textures

}
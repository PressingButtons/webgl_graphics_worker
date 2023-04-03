{

    GL_Engine.compile = async function(details) {
        try {
            const shader_programs = { };
            for(const shader_program_name in details) 
                shader_programs[shader_program_name] = await createShaderProgram(gl, details[shader_program_name], this.base_uri);
            return shader_programs;
        } catch(err) {
            throw err;
        }
    }

    const createShaderProgram = async(gl, program_detail, base) => {
        try {
            const vertex_text = await fetch(new URL(program_detail.vertex, base)).then(res => res.text( ));
            const fragment_text = await fetch(new URL(program_detail.fragment, base)).then(res => res.text( ));
            const program = createLinkedProgram(gl, vertex_text, fragment_text);
            const attributes = findAttributes(gl, program, vertex_text, fragment_text);
            const uniforms = findUniforms(gl, program, vertex_text, fragment_text);
            return {
                program: program,
                attributes: attributes,
                uniforms: uniforms
            }
        } catch(err) {
            throw err;
        }
    }

    const createLinkedProgram = (gl, vertex_text, fragment_text) => {
        try {
            const vertex_shader =  defineShader(gl, vertex_text, gl.VERTEX_SHADER);
            const fragment_shader = defineShader(gl, fragment_text, gl.FRAGMENT_SHADER);  
            return defineProgram(gl, vertex_shader, fragment_shader);
        } catch (err) {
            throw err;
        }
    }

    const defineShader = (gl, shader_text, shader_type) => {
        const shader = gl.createShader(shader_type);
        gl.shaderSource(shader, shader_text);
        gl.compileShader(shader);
        const success = validateShader(gl, shader, shader_text);
        if(success) return shader;
        else throw 'failed to compile \n' + shader_text;
    }

    const validateShader = (gl, shader, text) => {
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return true;
        console.error(text);
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw 'Error compiling shader!';
    }

    const defineProgram = (gl, vertex_shader, fragment_shader) => {
        const program = gl.createProgram( );
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program, gl.LINK_STATUS);
        const status = valideProgramLink(gl, program);
        if(status) return program;
        else throw status 
    }

    const valideProgramLink = (gl, program) => {
        if(gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
        const err = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw err;
    }

    const findAttributes = (gl, program, vertex_text, fragment_text) => {
        const keys = getVariableKeys(vertex_text, fragment_text, 'attribute');
        const attributes = { };
        for(const key of keys) attributes[key] = gl.getAttribLocation(program, key);
        return attributes;
    }

    const findUniforms = (gl, program, vertex_text, fragment_text) => {
        const keys = getVariableKeys(vertex_text, fragment_text, 'uniform');
        const uniforms = { };
        for(const key of keys) uniforms[key] = gl.getUniformLocation(program, key);
        return uniforms;
    }

    const getVariableKeys = (vertex_text, fragment_text, variable_type) => {
        const vertex_attributes = findParameter(vertex_text, variable_type);
        const fragment_attributes = findParameter(fragment_text, variable_type);
        const keys = [].concat(vertex_attributes, fragment_attributes);
        return [...new Set(keys).values( )];
    }

    const findParameter = (text, parameter) => {
        const regex = new RegExp(`(?<=${parameter} ).*`, 'g');
        const results = text.match(regex);
        const params  = results ? results.map( x => x.substring(x.lastIndexOf(' ') + 1, x.length - 1)) : [];
        return params;
    }
}
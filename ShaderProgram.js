class ShaderProgram {
    constructor(vertexId, fragmentId, shaderInfo) {
        // Create shader program using the provided vertex and fragment shader ids
        this.program = createShaderProgram(vertexId, fragmentId);
        gl.useProgram(this.program);

        this.attributes = {}
        this.uniforms = {};

        // Extract attribute and uniform information from the shaderInfo object
        // and look up their locations
        Object.entries(shaderInfo.attributes).forEach(([key, value]) => {
            this.attributes[key] = gl.getAttribLocation(this.program, value);
        })

        Object.entries(shaderInfo.uniforms).forEach(([key, value]) => {
            this.uniforms[key] = gl.getUniformLocation(this.program, value);
        })

        // Send projection matrix
        // If this changes, you have to send the new matrix to all shader programs again!
        gl.uniformMatrix4fv(this.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
    }

    enable() {
        currentShaderProgram = this;
        gl.useProgram(this.program);
    }
}
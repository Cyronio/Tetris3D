class Shape {
    constructor() {
        this.vertices = [];
        this.colors = [];
        this.normals = [];

        this.buffers = {
            // initialize buffers
            vertexBuffer: gl.createBuffer(),
            colorBuffer: gl.createBuffer(),
            normalBuffer: gl.createBuffer()
        }

        // initialize model and modelView matrices
        this.modelMatrix = mat4.create();
        this.normalMatrix = mat3.create();

        this.scaleFactor = 1; //accounting for scale difference in objects
    }

    initData(vertices, colors, normals) {
        // flatten & convert data to 32 bit float arrays 
        this.vertices = new Float32Array(vertices.flat());
        this.colors = new Float32Array(colors.flat());
        this.normals = new Float32Array(normals.flat());

        /// send data to buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
    }

    draw() {
        // set up attributes
        Shape.setupAttribute(this.buffers.vertexBuffer, currentShaderProgram.attributes.vertexLocation);
        Shape.setupAttribute(this.buffers.colorBuffer, currentShaderProgram.attributes.colorLocation);
        Shape.setupAttribute(this.buffers.normalBuffer, currentShaderProgram.attributes.normalLocation);

        // combine view and model matrix into modelView matrix
        const modelViewMatrix = mat4.create();
        mat4.mul(modelViewMatrix, matrices.viewMatrix, this.modelMatrix);

        // construct normal matrix as inverse transpose of modelView matrix
        mat3.normalFromMat4(this.normalMatrix, modelViewMatrix);

        // send modelView and normal matrix to GPU
        gl.uniformMatrix4fv(currentShaderProgram.uniforms.modelViewMatrix, gl.FALSE, modelViewMatrix);
        gl.uniformMatrix3fv(currentShaderProgram.uniforms.normalMatrix, gl.FALSE, this.normalMatrix);

        // draw the object
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
        
    }


    rotate(angle, axis, global = false) {
        if (!global) {
            /**
             * The transformation functions that glMatrix provides apply the new transformation as the right hand operand,
             * which means the new transformation will be the first one to be applied (this will result in a local transformation)
             *
             * The function call below would look like this if you write down the matrices directly:
             * modelMatrix * rotationMatrix
             */
            mat4.rotate(this.modelMatrix, this.modelMatrix, angle, axis);
        } else {
            /**
             * To get world transformations, you need to apply the new transformation after all the other transformations, i.e. as the left-most operand:
             * rotationMatrix * modelMatrix
             * 
             * You can do this manually by constructing the transformation matrix and then using mat4.multiply(out, leftOperand, rightOperand).
             */
            const rotationMatrix = mat4.create();
            mat4.fromRotation(rotationMatrix, angle, axis);
            mat4.mul(this.modelMatrix, rotationMatrix, this.modelMatrix)
        }
    }

    scale(vector, global = false) {
        //local scaling
        if (!global) {
            mat4.scale(this.modelMatrix,this.modelMatrix, vector);
        }
        else {
        //global scaling
            const scaleMatrix = mat4.create();
            mat4.scale(scaleMatrix, scaleMatrix, vector);
            mat4.mul(this.modelMatrix, scaleMatrix, this.modelMatrix)
        }
        
    }

    translate(vector, global = false) {

        if (!global) {
            mat4.translate(this.modelMatrix, this.modelMatrix, vector);
        }
        else {
            const translateMatrix = mat4.create();
            mat4.translate(translateMatrix, translateMatrix, vector);
            mat4.mul(this.modelMatrix, translateMatrix, this.modelMatrix)
        }
        
    }

    static setupAttribute(buffer, location) {

        if (location === -1) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(
            location, // the attribute location
            3, // number of elements for each vertex
            gl.FLOAT, // type of the attributes
            gl.FALSE, // should data be normalised?
            0, // stride
            0 // offset
        );

        // enable the attribute
        gl.enableVertexAttribArray(location);
    }
}

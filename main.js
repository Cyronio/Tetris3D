window.onload = async () => {
    // basic setup 

    
    
    let canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.clearColor(0, 0, 0, 1);
    orthl = -14;
    orthr = 14;
    orthu = -7;
    ortho = 7;

    // create & send projection matrix
    mat4.ortho(matrices.projectionMatrix,orthl,orthr,orthu,ortho, 0.1, 50)

    // create view matrix
    mat4.lookAt(matrices.viewMatrix, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
    // translate view matrix
    mat4.translate(matrices.viewMatrix, matrices.viewMatrix, [0, -3, -20])
    mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, toRad(30), [1,0,0])
    mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, -toRad(30), [0,1,0])

    // create shader programs and enable one of them
    shaderPrograms.noLightProgram = new ShaderProgram(shaders.noLight, shaders.fragment, shaderInfo);
    shaderPrograms.withLightProgram = new ShaderProgram(shaders.withLight, shaders.fragment, shaderInfo);
    shaderPrograms.withPhongLightProgram = new ShaderProgram(shaders.withPhongLight, shaders.fragment, shaderInfo);
    shaderPrograms.PhongSpecularProgram = new ShaderProgram(shaders.phongFvshader, shaders.phongF, shaderInfo);
    shaderPrograms.PhongDiffuseProgram = new ShaderProgram(shaders.phongFvshader, shaders.phongFdiffuse, shaderInfo);
    shaderPrograms.noLightProgram.enable();


    //  create grid and full grid for toggling
    grid = createGrid();
    bonus = createBonusGrid();
    
    //create first tetracube and move it to the top of the grid
    tetras.push(createTetra());
    tetras[0].translate([0,10,0]);
    
    //functionality flags
    pause = false;
    fast = false;
    bonus_grid = false;
    orth = true;
    gameOver = false;
    

    window.addEventListener("keydown", (event) => {

        //lighting
        if (event.key == 'q') {
            shaderPrograms.noLightProgram.enable();
        }
        
        else if (event.key == 'f') {
            if (currentShaderProgram != shaderPrograms.withPhongLightProgram) shaderPrograms.withPhongLightProgram.enable();
            else if (currentShaderProgram == shaderPrograms.withPhongLightProgram) shaderPrograms.PhongSpecularProgram.enable();
        }

        //game functions

        else if (event.key == 'p') {
            if (pause == true) pause = false;
            else if (pause == false) pause = true;
        }

        else if (event.key == ' ') {
            fast = true;
        }

        else if (event.key == 'g') {
            if (bonus_grid == true) bonus_grid = false;
            else if (bonus_grid == false) bonus_grid = true;
        }
        
    })
    
    window.addEventListener("keydown", (event) => {
        key = event.key;
        
        //camera movements

        if (key == 'j') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, toRad(5), [0,1,0])
        }
        if (key == 'l') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, -toRad(5), [0,1,0])
        }
        if (key == 'i') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, toRad(5), [1,0,0])
        }
        if (key == 'k') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, -toRad(5), [1,0,0])
        }
        if (key == 'u') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, toRad(5), [0,0,1])
        }
        if (key == 'o') {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, -toRad(5), [0,0,1])
        }

        //zoom
        if (key == '+') {

            console.log(matrices.projectionMatrix)
            mat4.scale(matrices.projectionMatrix, matrices.projectionMatrix, [1.01,1.01,1.01])
            gl.uniformMatrix4fv(shaderPrograms.noLightProgram.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
        }
        if (key == '-') {
            mat4.scale(matrices.projectionMatrix, matrices.projectionMatrix, [0.99,0.99,0.99])
            gl.uniformMatrix4fv(shaderPrograms.noLightProgram.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
        }

        //perspective vs orthographic
        if (key == 'v') {
            if (orth == true) {
                mat4.perspective(matrices.projectionMatrix, toRad(45), canvas.clientWidth / canvas.clientHeight, 0.1, 100);
                gl.uniformMatrix4fv(shaderPrograms.noLightProgram.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
                orth = false;
            }
            else if (orth == false) {
                mat4.ortho(matrices.projectionMatrix,orthl,orthr,orthu,ortho, 0.1, 50);
                gl.uniformMatrix4fv(shaderPrograms.noLightProgram.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
                orth = true;

            }
            
        }

        

        //Tetracube movements

        if (pause == false && fast == false) {
            if (key == "ArrowLeft" || key == 'a') {
                tetras[shapeSelect].translate([-1, 0, 0]);
                if (collision(tetras[shapeSelect]) == true || tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].translate([1, 0, 0]);
            }
            if (key == "ArrowRight" || key == 'd') {
                tetras[shapeSelect].translate([1, 0, 0]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].translate([-1, 0, 0]);
            }
            if (key == "ArrowUp" || key == 'w') {
                tetras[shapeSelect].translate([0, 0, -1]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].translate([0, 0, 1]);
            }
            if (key == "ArrowDown" || key == 's') {
                tetras[shapeSelect].translate([0, 0, 1]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].translate([0, 0, -1]);
            }
            if (key == "x") {
                tetras[shapeSelect].rotate([1,0,0]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([-1, 0, 0]);
            } 
            if (key == "X") {
                tetras[shapeSelect].rotate([-1,0,0]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([1, 0, 0]);
            }
            if (key == "y") {
                tetras[shapeSelect].rotate([0,1,0]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([0, -1, 0]);
            } 
            if (key == "Y") {
                tetras[shapeSelect].rotate([0,-1,0]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([0, 1, 0]);
            } 
            if (key == "z" || key == 'c') {
                tetras[shapeSelect].rotate([0,0,1]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([0, 0, -1]);
            } 
            if (key == "Z" || key == 'C') {
                tetras[shapeSelect].rotate([0,0,-1]);
                if (collision(tetras[shapeSelect]) == true|| tetCollision(tetras[shapeSelect]) == true) tetras[shapeSelect].rotate([0, 0, 1]);
            }
            
            

        }

        
        
    })

    //wheel zoom
    window.addEventListener("wheel", (event) => {
        mat4.scale(matrices.projectionMatrix, matrices.projectionMatrix, [1 - event.deltaY * 0.001,1 - event.deltaY * 0.001 ,1 - event.deltaY * 0.001])
        gl.uniformMatrix4fv(shaderPrograms.noLightProgram.uniforms.projectionMatrix, gl.FALSE, matrices.projectionMatrix);
        
    }) 
    
    

    //toggle for mouse movement
    let mousemove = false;
    
    window.addEventListener("mousedown", (event) => {
        if (event.buttons == 1) {
            mousemove = true;
        }  
    }) 

    window.addEventListener("mousemove", (event) => {
        if (mousemove == true) {
            mat4.rotate(matrices.viewMatrix, matrices.viewMatrix, toRad(5), [0,event.movementX/100,0])
        }
    })

    window.addEventListener("mouseup", (event) => {
        if (event.buttons == 0) {
            mousemove = false;
        }
    })

    requestAnimationFrame(render);
}

// Previous frame time
let then = 0;

function render(now) {
    // calculate elapsed time in seconds
    let delta = now - then;
    if (fast == false) {
        delta *= 0.0005;
    }
    
    else if (fast == true) {
        delta *= 0.008;
    };
    then = now;

    // Set light position and move it to view space
    const lightPosition = vec4.fromValues(-4, 10, 0, 1);
    vec4.transformMat4(lightPosition, lightPosition, matrices.viewMatrix);
    gl.uniform4fv(currentShaderProgram.uniforms.lightPosition, lightPosition);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //grid
    grid.draw();

    //full grid
    if (bonus_grid == true) bonus.draw();

    checkGameOver();

    if (gameOver == true) {
        if (confirm("Game Over!") == true) {
            location.reload();
        };
    }
    //check if Tetracube hits the bottom
    checkBottom();
    
    if (pause == false) {
        tetras[shapeSelect].translate([0,-1 * delta ,0]);
    }

    //check if Tetracube its the top of another tetracube
    checkTetBottom();

    tetras.forEach(tetra => {
        tetra.draw();
    });

    

    requestAnimationFrame(render)
}


//obj-File-Parser (left for possible bonus effects [not included])
function loadObj(obj) {
    // substitute for webserver loading (which did not work) [-> data as string objects at the end of this file]
    data = obj;
    const lines = data.split('\n');
    vertices = [[0,0,0]];
    normals = [[0,0,0]];
    faces = [];
    normalFaces = []
    lines.forEach(line => {
        //getting the vertices
        if (line[0] == 'v' && line[1] == ' ') {
            parts = line.split(' ');
            vertex = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
            vertices.push(vertex);
        }

        //getting normals
        else if (line[0] == 'v' && line[1] == 'n') {
            parts = line.split(' ');
            normal = [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])];
            normals.push(normal);
           
        }

        

        //getting the faces
        else if (line[0] == 'f') {
            parts = line.split(' ');
            first = parts[1].split('/');
            second = parts[2].split('/');
            third = parts[3].split('/');
            locs = [];  
            face = [parseInt(first[0]), parseInt(second[0]), parseInt(third[0])]; 
            faces.push(face);
            normalFace = [parseInt(first[2]), parseInt(second[2]), parseInt(third[2])];
            normalFaces.push(normalFace); 
            
        }
    })
    resultVertices = [];
    faces.forEach(face => {
        for (i = 0; i < 3; i++) { 
            resultVertices.push((vertices[face[i]])[0]);
            resultVertices.push((vertices[face[i]])[1]);
            resultVertices.push((vertices[face[i]])[2]);
        }
        
    })
    resultNormals = [];
    normalFaces.forEach(normalFace => {
        for (i = 0; i < 3; i++) { 
            resultNormalArray = [];
            resultNormals.push((normals[normalFace[i]])[0]);
            resultNormals.push((normals[normalFace[i]])[1]);
            resultNormals.push((normals[normalFace[i]])[2]);
        }
        
    })

    result = [resultVertices, resultNormals];
    
    return result;
}



function checkBottom() {
    found = false;
    tetras[shapeSelect].shapes.forEach (shape => {
        if (found == false) {
            if (shape.modelMatrix[13] <= 0.5) {
                found = true;
                let diff = 0.5 - shape.modelMatrix[13];
                tetras[shapeSelect].shapes.forEach (s => {
                    s.modelMatrix[13] = s.modelMatrix[13] + diff;
                });
                checkFull();
                tetras.push(createTetra());
                pause = true;
                shapeSelect = shapeSelect + 1;
                tetras[shapeSelect].translate([0,10,0]);
                pause = false;
                if (fast == true) fast = false;
            }
        }
        
    }
    )
}

function checkTetBottom() {
    found = false;
    if (shapeSelect != 0 && tetras[shapeSelect].transHist[1] < 9) {
        tetras[shapeSelect].shapes.forEach( shape => {
            if (found == false) {
                for (let i = 0; i < shapeSelect; i++) {
                    tetras[i].shapes.forEach( s =>
                        {
                            if (found == false) {
                                if (Math.abs(s.modelMatrix[12] - shape.modelMatrix[12]) < 0.01 && Math.abs(s.modelMatrix[13] - shape.modelMatrix[13]) < 0.99 && Math.abs(s.modelMatrix[14] - shape.modelMatrix[14]) < 0.01) {
                                    found = true;
                                    let diff = 1 - Math.abs(s.modelMatrix[13] - shape.modelMatrix[13]);
                                    tetras[shapeSelect].shapes.forEach (sh => {
                                        sh.modelMatrix[13] = sh.modelMatrix[13] + diff;
                                    });
                                    checkFull();
                                    tetras.push(createTetra());
                                    pause = true;
                                    shapeSelect = shapeSelect + 1;
                                    tetras[shapeSelect].translate([0,10,0]);
                                    pause = false;
                                    if (fast == true) fast = false;
                                            
                                }
                            }
                            
                        }
                    )
                }
            }
            
        })
    }
}

//check for collision with grid
function collision(tetra) {
    result = false;
    tetra.shapes.forEach( shape => {
        if (shape.modelMatrix[12] < 0.4 || shape.modelMatrix[12] > 3.6) result = true;
        if (shape.modelMatrix[14] < 0.4 || shape.modelMatrix[14] > 3.6) result = true;
        if (shape.modelMatrix[13] < 0.5) result = true;
    })
    return result;
}

//check for collision with other Tetracubes
function tetCollision(tetra) {
    result = false;
    if (shapeSelect != 0) {
        tetra.shapes.forEach( shape => {
            for (let i = 0; i < shapeSelect; i++) {
                tetras[i].shapes.forEach( s =>
                    {
                        if (Math.abs(s.modelMatrix[12] - shape.modelMatrix[12]) < 0.01 && Math.abs(s.modelMatrix[13] - shape.modelMatrix[13]) < 1 && Math.abs(s.modelMatrix[14] - shape.modelMatrix[14]) < 0.01) result = true;
                    }
                )
            }
        })
    }
    return result;
    

   
}

//check if one x/z-floor is full
function checkFull() {
    for (let i = 0; i<10; i++) {
        let count = 0;
        tetras.forEach( tetra => {
            tetra.shapes.forEach( shape => {
                if (Math.abs(shape.modelMatrix[13] - (i+0.5)) < 0.01) count++;
            })
        })
        if (count == 16) {
            tetras.forEach( tetra => {
                tetra.shapes.forEach( shape => {
                    if (Math.abs(shape.modelMatrix[13] - (i+0.5)) < 0.01) shape.modelMatrix[13] = -100 - shapeSelect;
                    else if (shape.modelMatrix[13] > i+0.5) shape.modelMatrix[13] = shape.modelMatrix[13]-1;
                })
            })
        }
    }
    
}

function checkGameOver() {
    let count = 0;
    for (let i = 0; i < shapeSelect; i++) {
        tetras[i].shapes.forEach( shape => {
            if (shape.modelMatrix[13] > 10) count++;
        })
    }
    if (count > 2) gameOver = true;
}

//create tetracube with random shape
function createTetra() {
    types = ['I', 'O', 'L', 'T', 'N', 'right', 'left', 'tripod'];
    value = Math.floor(Math.random() * 8);
    const tetra = new Tetracube(types[value]);
    return tetra;
}

//create cubes
function createShape() {
    // define vertex positions & colors
    const vertices = [
        0.2, 0.2, 0.2,
        -0.2, 0.2, 0.2, 
        0.2, -0.2, 0.2, 

        -0.2, 0.2, 0.2,
        -0.2, -0.2, 0.2, 
        0.2, -0.2, 0.2, // front face end

        -0.2, -0.2, -0.2,
        -0.2, -0.2, 0.2,
        -0.2, 0.2, 0.2,

        -0.2, -0.2, -0.2, 
        -0.2, 0.2, 0.2, 
        -0.2, 0.2, -0.2,// left face end

        0.2, 0.2, -0.2, 
        -0.2, -0.2, -0.2, 
        -0.2, 0.2, -0.2, 

        0.2, 0.2, -0.2, 
        0.2, -0.2, -0.2, 
        -0.2, -0.2, -0.2,  // back face end

        0.2, -0.2, 0.2, 
        -0.2, -0.2, -0.2, 
        0.2, -0.2, -0.2, 

        0.2, -0.2, 0.2, 
        -0.2, -0.2, 0.2, 
        -0.2, -0.2, -0.2,  // bottom face end

        0.2, 0.2, 0.2, 
        0.2, -0.2, -0.2,
        0.2, 0.2, -0.2, 

        0.2, -0.2, -0.2,
        0.2, 0.2, 0.2, 
        0.2, -0.2, 0.2,  // right face end

        0.2, 0.2, 0.2, 
        0.2, 0.2, -0.2, 
        -0.2, 0.2, -0.2, 

        0.2, 0.2, 0.2, 
        -0.2, 0.2, -0.2, 
        -0.2, 0.2, 0.2,  // Top face end
    ];

    const colorData = [
        [0.5, 0.5, 0.5], // Front face: black
        [1.0, 0.0, 0.0], // left face: red
        [0.0, 1.0, 0.0], // back face: green
        [0.0, 0.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0], // Right face: yellow
        [1.0, 0.0, 1.0], // top face: pink
    ];

    const colors = [];

    const normalData = [
        [0, 0, 1], // front
        [-1, 0, 0], // left
        [0, 0, -1], // back
        [0, -1, 0], // bottom
        [1, 0, 0], // right
        [0, 1, 0], // top
    ];

    // add one color and normal per vertex
    const normals = [];

    /// add one color per face, so 6 times for each color + normal data
    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < 6; ++j) {
            normals.push(normalData[i]);
            colors.push(colorData[i]);
        }
    }

    



    // create shape object and initialize data
    const cube = new Shape();
    cube.initData(vertices, colors, normals)

    return cube;

    
}

function createGrid() {
    vertices = []

    for (let i = 0; i < 11; i++) {
        vertices.push([0.0,i,0.0])
        vertices.push([4.0, i, 0.0])
    }

    for (let i = 0; i < 11; i++) {
        vertices.push([0.0,i,0.0])
        vertices.push([0.0, i, 4.0])
    }

    for (let i = 0; i < 5; i++) {
        vertices.push([0.0,10,i])
        vertices.push([0.0, 0.0, i])
    }

    for (let i = 0; i < 5; i++) {
        vertices.push([i,10,0.0])
        vertices.push([i, 0.0, 0.0])
    }

    for (let i = 0; i < 5; i++) {
        vertices.push([i,0.0,0.0])
        vertices.push([i, 0.0, 4.0])
    }

    for (let i = 0; i < 5; i++) {
        vertices.push([0.0, 0.0, i])
        vertices.push([4.0, 0.0, i])
    }

    colors = []

    for (let i = 0; i < vertices.length; i++) {
        colors.push([0,1,1])
    }

    const grid = new Grid();
    grid.initData(vertices,colors);

    return grid;
}

function createBonusGrid() {
    vertices = []

    for (let i = 0; i < 5; i++) {
        vertices.push([i,10,4])
        vertices.push([i, 0.0, 4])
    }

    for (let i = 0; i < 5; i++) {
        vertices.push([4,10,i])
        vertices.push([4, 0.0, i])
    }

    for (let n = 1; n < 11; n++) {
        for (let i = 0; i < 5; i++) {
            vertices.push([i, n, 0.0])
            vertices.push([i, n, 4.0])
        }
        for (let i = 0; i < 5; i++) {
            vertices.push([0.0, n, i])
            vertices.push([4.0, n, i])
        }    
    }

    colors = []

    for (let i = 0; i < vertices.length; i++) {
        colors.push([0,1,1])
    }

    const grid = new Grid();
    grid.initData(vertices,colors);

    return grid;
}


function createObject(obj) {
    //substitute for webserver loading (which did not work)
    data = loadObj(obj);
    vertices = data[0];
    normalData = data[1];

    
    const colorData = [
        [0.5, 0.5, 0.5], // Front face: black
        [1.0, 0.0, 0.0], // left face: red
        [0.0, 1.0, 0.0], // back face: green
        [0.0, 0.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0], // Right face: yellow
        [1.0, 0.0, 1.0], // top face: pink
    ];

    colors = [];
    normals = [];
    faces = vertices.length/3;

    for (i = 0; i < faces; i++) {
        
        for (j = 0; j < 3; j++) {
            colors.push([0.0, 1.0, 1.0]);          
        }
    }

    for (i = 0; i < vertices.length; i++) normals.push(normalData[i]);

    const object = new Shape();
    object.initData(vertices, colors, normals)

    return object;
        

}


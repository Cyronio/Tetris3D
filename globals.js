const { mat4, mat3, vec4 } = glMatrix;
const toRad = glMatrix.glMatrix.toRadian;

const tetras = [];
const shapes = [];
let gl = null;
let shapeSelect = 0;

const shaders = {
    noLight: "v-shader-nolight",
    withLight: "v-shader",
    withPhongLight: "v-shader-phonglight",
    fragment: "f-shader",
    phongF: "phongF-shader",
    phongFvshader: "phongF-vshader",
    phongFdiffuse: "phongFdiffuse-shader"
}

let currentShaderProgram = null;

const shaderInfo = {
    attributes: {
        vertexLocation: "vertexPosition",
        colorLocation: "vertexColor",
        normalLocation: "vertexNormal"
    }, uniforms: {
        modelViewMatrix: "modelViewMatrix",
        projectionMatrix: "projectionMatrix",
        viewMatrix: "viewMatrix",
        normalMatrix: "normalMatrix",
        lightPosition: "lightViewPosition"
    }
}

const shaderPrograms = {
    noLightProgram: null,
    withLightProgram: null,
    withPhongLightProgram: null,
    PhongSpecularProgram: null,
    PhongDiffuseProgram: null
}

const matrices = {
    viewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
}
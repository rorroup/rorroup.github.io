
import { drawScene } from "./draw.js";


// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;
	
	uniform mat4 uRotationMatrix;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
	
	uniform mat4 uCameraPosition;
	uniform mat4 uCameraRotation;
	
	uniform vec3 uVertexColor;
	varying lowp vec4 vColor;
	
	uniform vec3 uLightAmbient;
	uniform vec3 uLightDirection;
	uniform vec3 uLightColor;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uModelViewMatrix * uRotationMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
	  
	  vColor = vec4(uVertexColor, 1.0);

      // Apply lighting effect
	  
	  vLighting = uLightAmbient + max(-dot(aVertexNormal, uLightDirection), 0.0) * uLightColor;
    }
  `;

const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;
	
	varying lowp vec4 vColor;

    void main(void) {
      // highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
	  highp vec4 texelColor = vColor;

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
  `;


//
// start here
//
function main() {
  const canvas = document.querySelector("#glcanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  
  gl.viewport(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  
  // Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
  // Collect all the info needed to use the shader program.
// Look up which attribute our shader program is using
// for aVertexPosition and look up uniform locations.
const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
    textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
  },
  uniformLocations: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
	rotationMatrix: gl.getUniformLocation(shaderProgram, "uRotationMatrix"),
	cameraPosition: gl.getUniformLocation(shaderProgram, "uCameraPosition"),
	cameraRotation: gl.getUniformLocation(shaderProgram, "uCameraRotation"),
    uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
	VertexColor: gl.getUniformLocation(shaderProgram, "uVertexColor"),
	LightAmbient: gl.getUniformLocation(shaderProgram, "uLightAmbient"),
	LightDirection: gl.getUniformLocation(shaderProgram, "uLightDirection"),
	LightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
  },
};

  // Set clear color to black, fully opaque
  // gl.clearColor(1.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  // gl.clear(gl.COLOR_BUFFER_BIT);

// Here's where we call the routine that builds all the
// objects we'll be drawing.
let bodies = [];


function buildObjMeshFromData(obj, vertexData){
	// console.log(`Attempting to load object: '${obj.name}'`);
	let v = [];
	let vt = [];
	let vn = [];
	
	// use the faces indices to access the other arrays.
	for(let i = 0; i < obj.f.length; i++){
		// check index within array length range to access
		if(obj.f[i][0][0] <= 0 || vertexData.v.length < obj.f[i][0][0] || obj.f[i][1][0] <= 0 || vertexData.v.length < obj.f[i][1][0] || obj.f[i][2][0] <= 0 || vertexData.v.length < obj.f[i][2][0]){
			return false;
		}
		if(obj.f[i][0][1] <= 0 || vertexData.vt.length < obj.f[i][0][1] || obj.f[i][1][1] <= 0 || vertexData.vt.length < obj.f[i][1][1] || obj.f[i][2][1] <= 0 || vertexData.vt.length < obj.f[i][2][1]){
			return false;
		}
		if(obj.f[i][0][2] <= 0 || vertexData.vn.length < obj.f[i][0][2] || obj.f[i][1][2] <= 0 || vertexData.vn.length < obj.f[i][1][2] || obj.f[i][2][2] <= 0 || vertexData.vn.length < obj.f[i][2][2]){
			return false;
		}
		
		// check index not decimal Number
		if(!Number.isInteger(obj.f[i][0][0]) || !Number.isInteger(obj.f[i][1][0]) || !Number.isInteger(obj.f[i][2][0])){
			return false;
		}
		if(!Number.isInteger(obj.f[i][0][1]) || !Number.isInteger(obj.f[i][1][1]) || !Number.isInteger(obj.f[i][2][1])){
			return false;
		}
		if(!Number.isInteger(obj.f[i][0][2]) || !Number.isInteger(obj.f[i][1][2]) || !Number.isInteger(obj.f[i][2][2])){
			return false;
		}
		
		v.push(...vertexData.v[obj.f[i][0][0] - 1], ...vertexData.v[obj.f[i][1][0] - 1], ...vertexData.v[obj.f[i][2][0] - 1]);
		vt.push(...vertexData.vt[obj.f[i][0][1] - 1], ...vertexData.vt[obj.f[i][1][1] - 1], ...vertexData.vt[obj.f[i][2][1] - 1]);
		vn.push(...vertexData.vn[obj.f[i][0][2] - 1], ...vertexData.vn[obj.f[i][1][2] - 1], ...vertexData.vn[obj.f[i][2][2] - 1]);
		
	}
	
	let f = 3 * obj.f.length;
	let model = new Model(gl, v, vt, vn, f, obj.material);
	bodies.push(new Body(new Float32Array([0.0, 0.0, 0.0, 1.0]), new Float32Array([0.0, 0.0, 0.0, 1.0]), model, gl));
	
	console.log(`Object '${obj.name}' loaded successfully!`);
	return true;
}

fetch("asset/scene3.obj")
.then((res) => res.text())
.then((text) => {
	let textload = document.getElementById("textload");
	textload.textContent = text;
	return pen_obj.obj_read(text);
})
.then((loaded) => {
	document.getElementById("INFO").textContent = `OBJECTS READ: ${loaded.o.length}\nOBJ LOADING ERRORS: ${loaded.e}\nLOADED OBJECTS: `;
	if(loaded.e <= 0){
		let s = 0;
		for(let i = 0; i < loaded.o.length; i++){
			s += buildObjMeshFromData(loaded.o[i], loaded.vd);
		}
		document.getElementById("INFO").textContent += `${s}/${loaded.o.length}`;
	}
})
.catch((e) => {
	console.error(e);
	let textload = document.getElementById("textload");
	textload.textContent = e;
});


// Flip image pixels into the bottom-to-top order that WebGL expects.
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


let then = 0;

// Draw the scene repeatedly
function render(now) {
  let deltaTime = now - then;
  then = now;

  drawScene(gl, programInfo, bodies, deltaTime);
  
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

}


main();


window.onkeydown = function(event_){
	// console.log(event_);
	if(event_.key == 'w' || event_.key == 'W'){
		cameraPos[2] += 0.2;
	}
	if(event_.key == 's' || event_.key == 'S'){
		cameraPos[2] -= 0.2;
	}
	if(event_.key == 'a' || event_.key == 'A'){
		cameraPos[0] += 0.2;
	}
	if(event_.key == 'd' || event_.key == 'D'){
		cameraPos[0] -= 0.2;
	}
	
	if(event_.key == "ArrowUp"){
		cameraRot[0] -= 0.05;
	}
	if(event_.key == "ArrowDown"){
		cameraRot[0] += 0.05;
	}
	if(event_.key == "ArrowLeft"){
		cameraRot[1] -= 0.05;
	}
	if(event_.key == "ArrowRight"){
		cameraRot[1] += 0.05;
	}
};

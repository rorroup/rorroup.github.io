
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


fetch("asset/scene3.obj")
.then((res) => res.text())
.then((text) => {
	return pen_obj.obj_load(text);
})
.then((loaded) => {
	for(let i = 0; i < loaded.length; i++){
		bodies.push(new Body(new Float32Array([0.0, 0.0, 0.0, 1.0]), new Float32Array([0.0, 0.0, 0.0, 1.0]), loaded[i], gl));
	}
})
.catch((e) => {
	console.error(e);
});

document.getElementById("glcanvas").addEventListener("mousemove", function(event_){
	let mouseX = event_.offsetX;
	let mouseY = event_.offsetY;
	
	const canvasWidth = event_.target.offsetWidth;
	const canvasHeight = event_.target.offsetHeight;
	
	let fNear = 0.1;
	let fFov = 45.0;
	let fFovRad = Math.tan(fFov * 0.5 / 180.0 * Math.PI);
	
	const campos = new Vector3(-cameraPos[0], -cameraPos[1], -cameraPos[2]);
	const camdir = new Vector3(-cameraDir[0], -cameraDir[1], cameraDir[2]);
	
	let vecRight = camdir.cross(new Vector3(0.0, 1.0, 0.0));
	vecRight = vecRight.scale(1 / vecRight.magnitude()); // Normalize.
	let vecUpwards = vecRight.cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
	
	let cam2mouse = camdir.scale(fNear).add(vecRight.scale(2 * (canvasWidth / canvasHeight) * fNear * fFovRad * ((mouseX - canvasWidth / 2) / canvasWidth))).add(vecUpwards.scale(2 * fNear * fFovRad * ((canvasHeight / 2 - mouseY) / canvasHeight)));
	let mouse3d = campos.add(cam2mouse);
	
	let cam2mouseNormalized = cam2mouse.scale(1 / cam2mouse.magnitude());
	
	let intersections = [];
	
	for(let i = 0; i < bodies.length; i++){
		let body = bodies[i];
		body.selected = false;
		for(let j = 0; j < body.model.vertexCount / 3; j++){
			let v1 = new Vector3(...body.model.vertices.slice(9 * j + 0, 9 * j + 3));
			let v2 = new Vector3(...body.model.vertices.slice(9 * j + 3, 9 * j + 6));
			let v3 = new Vector3(...body.model.vertices.slice(9 * j + 6, 9 * j + 9));
			
			let vec1 = v1.add(v2.scale(-1.0));
			let vec2 = v2.add(v3.scale(-1.0));
			let vec3 = v3.add(v1.scale(-1.0));
			
			let n1 = v1.add(campos.scale(-1.0)).cross(vec1);
			let n2 = v2.add(campos.scale(-1.0)).cross(vec2);
			let n3 = v3.add(campos.scale(-1.0)).cross(vec3);
			
			if(cam2mouse.dot(n1) > 0 && cam2mouse.dot(n2) > 0 && cam2mouse.dot(n3) > 0 && cam2mouse.dot(vec1.cross(vec2)) < 0){
				// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
				let n = vec1.cross(vec2);
				let parallel = cam2mouse.dot(n);
				if(parallel != 0){
					let d = v1.add(campos.scale(-1.0)).dot(n) / parallel;
					// let intersection = campos.add(cam2mouse.scale(d));
					intersections.push([i, d]);
				}
				break;
			}
		}
	}
	
	if(intersections.length > 0){
		intersections.sort((a, b) => {return a[1] - b[1];});
		bodies[intersections[0][0]].selected = true;
	}
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


function update_cameraDir(){
	let r = 1;
	
	let x = -r * Math.sin(cameraRot[1]) * Math.cos(cameraRot[0]);
	let z = -r * Math.cos(cameraRot[1]) * Math.cos(cameraRot[0]);
	let y = r * Math.sin(cameraRot[0]);
	
	cameraDir = [x, y, z, 1.0];
	
	let phi = Math.asin(y / r);
	let theta = Math.atan2(-x, -z);
}
update_cameraDir();


class Vector3{
	constructor(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	scale(scalar){
		return new Vector3(scalar * this.x, scalar * this.y, scalar * this.z);
	}
	
	dot(v3){
		return this.x * v3.x + this.y * v3.y + this.z * v3.z;
	}
	
	cross(v3){
		return new Vector3(
			this.y * v3.z - v3.y * this.z,
			-(this.x * v3.z - v3.x * this.z),
			this.x * v3.y - v3.x * this.y
		);
	}
	
	add(v3){
		return new Vector3(this.x + v3.x, this.y + v3.y, this.z + v3.z);
	}
	
	magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
}

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
	update_cameraDir();
};

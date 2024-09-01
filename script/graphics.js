
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

async function loadOBJfile(t){
	let loadedObjects = [];
	let vertexData = {
		v: [],
		vt: [],
		vn: [],
	};
	let ERROR = 0;
	let o = {
		name: "",
		f: [],
		color: [0.2, 0.2, 0.2],
	};
	
	let mtllib = {};
	
	let tableloaded = document.getElementById("tableload").children[0];
	
	// TODO: 
	// account for whitespaces and missing texCoord indices.
	const l = t.split('\n');
	for(let j = 0; j < l.length; j++){
		const row = l[j];
		if(row[0] != '#'){
			const tr = document.createElement("tr");
			
			let w = row.split(' ');
			
			switch(w[0]){
				case "o":{
					if(o.f.length > 0){
						loadedObjects.push(o);
					}
					
					o = {
						name: "",
						f: [],
						color: [0.2, 0.2, 0.2],
					};
					if(w.length >= 2){
						o.name = w[1];
					}
					let td = document.createElement("td");
					td.textContent = w[0];
					tr.appendChild(td);
					let td2 = document.createElement("td");
					td2.textContent = o.name;
					tr.appendChild(td2);
					tableloaded.appendChild(tr);
					}
					break;
				case "v":{
					if(w.length == 4){
						let x = Number(w[1]);
						let y = Number(w[2]);
						let z = Number(w[3]);
						if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
							vertexData.v.push([x, y ,z]);
						}else{
							ERROR++;
						}
						
						let td = document.createElement("td");
						td.textContent = w[0];
						tr.appendChild(td);
						let tdx = document.createElement("td");
						tdx.textContent = w[1];
						tr.appendChild(tdx);
						let tdy = document.createElement("td");
						tdy.textContent = w[2];
						tr.appendChild(tdy);
						let tdz = document.createElement("td");
						tdz.textContent = w[3];
						tr.appendChild(tdz);
						tableloaded.appendChild(tr);
					}else{
						ERROR++;
					}
					}
					break;
				case "vt":{
					if(w.length == 3){
						let x = Number(w[1]);
						let y = Number(w[2]);
						if(!isNaN(x) && !isNaN(y)){
							vertexData.vt.push([x, y]);
						}else{
							ERROR++;
						}
						
						let td = document.createElement("td");
						td.textContent = w[0];
						tr.appendChild(td);
						let tdx = document.createElement("td");
						tdx.textContent = w[1];
						tr.appendChild(tdx);
						let tdy = document.createElement("td");
						tdy.textContent = w[2];
						tr.appendChild(tdy);
						tableloaded.appendChild(tr);
					}else{
						ERROR++;
					}
					}
					break;
				case "vn":{
					if(w.length == 4){
						let x = Number(w[1]);
						let y = Number(w[2]);
						let z = Number(w[3]);
						if(!isNaN(x) && !isNaN(y) && !isNaN(z)){
							vertexData.vn.push([x, y ,z]);
						}else{
							ERROR++;
						}
						
						let td = document.createElement("td");
						td.textContent = w[0];
						tr.appendChild(td);
						let tdx = document.createElement("td");
						tdx.textContent = w[1];
						tr.appendChild(tdx);
						let tdy = document.createElement("td");
						tdy.textContent = w[2];
						tr.appendChild(tdy);
						let tdz = document.createElement("td");
						tdz.textContent = w[3];
						tr.appendChild(tdz);
						tableloaded.appendChild(tr);
					}else{
						ERROR++;
					}
					}
					break;
				case "f":{
					if(w.length == 4){
						let l = [];
						for(let i = 1; i < 4; i++){
							let ww = w[i].split('/');
							let v = Number(ww[0]);
							let vn = Number(ww[1]);
							let vt = Number(ww[2]);
							if(!isNaN(v) && !isNaN(vn) && !isNaN(vt)){
								l.push([v, vn, vt]);
							}else{
								ERROR++;
							}
						}
						o.f.push(l);
						
						let td = document.createElement("td");
						td.textContent = w[0];
						tr.appendChild(td);
						let tdx = document.createElement("td");
						tdx.textContent = w[1];
						tr.appendChild(tdx);
						let tdy = document.createElement("td");
						tdy.textContent = w[2];
						tr.appendChild(tdy);
						let tdz = document.createElement("td");
						tdz.textContent = w[3];
						tr.appendChild(tdz);
						tableloaded.appendChild(tr);
					}else{
						ERROR++;
					}
					}
					break;
				case "mtllib":{
					if(w.length == 2){
						const response = await fetch(`asset/${w[1]}`);
						const txt = await response.text();
						let loaded_colors = parseMaterialFile(txt);
						mtllib = {...mtllib, ...loaded_colors};
					}
					}
					break;
				case "usemtl":{
					if(w.length == 2){
						if(w[1] in mtllib){
							if("Kd" in mtllib[w[1]]){
								o.color = mtllib[w[1]]["Kd"];
							}
						}
					}
					}
					break;
				default:
					break;
			}
		}
	}
	if(o.f.length > 0){
		loadedObjects.push(o);
	}
	// console.log(`O: ${loadedObjects.length}. V: ${vertexData.v.length}. VN: ${vertexData.vn.length}. VT: ${vertexData.vt.length}.`);
	return {
		o: loadedObjects,
		vd: vertexData,
		e: ERROR,
	};
}

function parseMaterialFile(t){
	let materials = {};
	let newmtl = {};
	t.split('\n').forEach((row) => {
		if(row[0] != '#'){
			let w = row.split(' ');
			switch(w[0]){
				case "newmtl":{
					if("newmtl" in newmtl){
						materials[newmtl["newmtl"]] = newmtl;
					}
					newmtl = {};
					if(w.length >= 2){
						newmtl[w[0]] = w[1];
					}
					}
					break;
				case "Kd":{
					if(w.length == 4){
						let r = Number(w[1]);
						let g = Number(w[2]);
						let b = Number(w[3]);
						if(!isNaN(r) && !isNaN(g) && !isNaN(b)){
							newmtl[w[0]] = [r, g, b];
						}
					}
					}
					break;
				// TODO:
				case "Ns":
				case "Ka":
				case "Ks":
				case "Ke":
				case "Ni":
				case "d":
				case "illum":
				default:
					break;
			}
		}
	});
	if("newmtl" in newmtl){
		materials[newmtl["newmtl"]] = newmtl;
	}
	return materials;
}

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
	let model = new Model(gl, v, vt, vn, f, obj.color);
	bodies.push(new Body(new Float32Array([0.0, 0.0, 0.0, 1.0]), new Float32Array([0.0, 0.0, 0.0, 1.0]), model, gl));
	
	console.log(`Object '${obj.name}' loaded successfully!`);
	return true;
}

fetch("asset/scene3.obj")
.then((res) => res.text())
.then((text) => {
	let textload = document.getElementById("textload");
	textload.textContent = text;
	return loadOBJfile(text);
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


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel,
  );
/*
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image,
    );

    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
*/
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
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
};

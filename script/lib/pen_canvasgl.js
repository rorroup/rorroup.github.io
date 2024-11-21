
// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource){
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	
	// Create the shader program
	
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	// If creating the shader program failed, alert
	
	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		alert(
			`Unable to initialize the shader program: ${gl.getProgramInfoLog(
				shaderProgram,
			)}`,
		);
		return null;
	}
	
	return shaderProgram;
}


// creates a shader of the given type, uploads the source and
// compiles it.
function loadShader(gl, type, source){
	const shader = gl.createShader(type);
	
	// Send the source to the shader object
	
	gl.shaderSource(shader, source);
	
	// Compile the shader program
	
	gl.compileShader(shader);
	
	// See if it compiled successfully
	
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
		);
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}


function isPowerOf2(value){
	return (value & (value - 1)) === 0;
}

// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
function loadTexture(gl, url){
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
	const pixel = new Uint8Array([0, 255, 255, 255]); // opaque cyan
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
		if(isPowerOf2(image.width) && isPowerOf2(image.height)){
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(gl.TEXTURE_2D);
		}else{
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;
	
	return texture;
}

function createFramebuffer(gl, size)
{
	// create to render to
	const targetTextureWidth = size[0];
	const targetTextureHeight = size[1];
	const targetTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	
	// define size and format of level 0
	const level = 0;
	const internalFormat = gl.RGBA;
	const border = 0;
	const format = gl.RGBA;
	const type = gl.UNSIGNED_SHORT_4_4_4_4;
	const data = null;
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
		targetTextureWidth, targetTextureHeight, border,
		format, type, data);
	
	// set the filtering so we don't need mips
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	// Create and bind the framebuffer
	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	
	// attach the texture as the first color attachment
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
	
	return {
		framebuffer: fb,
		texture: [targetTexture],
	};
}

class Camera
{
	constructor(FoV, Znear, Zfar, aspectRatio, position = false, rotation = false)
	{
		this.FoV = FoV;
		this.Znear = Znear;
		this.Zfar = Zfar;
		this.aspectRatio = aspectRatio;
		this.FoVratio = Math.tan(FoV * 0.5 / 180.0 * Math.PI);
		this.projection = new Matrix(4);
		this.project();
		this.position = Vector4(position);
		this.position[3] = 1.0;
		this.rotation = Vector4(rotation);
		this.rotation[3] = 1.0;
		this.direction = Vector(4);
		this.rotate(this.rotation);
	}
	
	project(){
		this.projection[0] = 1 / this.FoVratio * this.aspectRatio;
		this.projection[5] = 1 / this.FoVratio;
		this.projection[10] = (this.Znear + this.Zfar) / (this.Znear - this.Zfar);
		this.projection[14] = 2.0 * (this.Znear * this.Zfar) / (this.Znear - this.Zfar);
		this.projection[11] = -1.0;
	}
	
	rotate(rotation){
		this.rotation.set(rotation);
		for(let i = 0; i < 3; i++){
			this.rotation[i] = ((this.rotation[i] * 100000000) % (2 * Math.PI * 100000000)) / 100000000;
		}
		this.direction.set([-Math.sin(this.rotation[1]) * Math.cos(this.rotation[0]), Math.sin(this.rotation[0]), -Math.cos(this.rotation[1]) * Math.cos(this.rotation[0]), 1.0]);
	}
	
	direct(direction){
		this.direction.set(direction);
		this.direction[3] = 0.0;
		this.direction.normalize();
		this.direction[3] = 1.0;
		this.rotation[0] = Math.asin(this.direction.y);
		this.rotation[1] = Math.atan2(-this.direction.x, -this.direction.z);
	}
	
	target(target){
		return this.direct(new Vector3(target).substract(this.position));
	}
}

class Material{
	constructor(newmtl = "")
	{
		this.newmtl = newmtl;
		this.Kd = new Float32Array([0.5, 0.5, 0.5]);
	}
}

const Material_DEFAULT = new Material();

class Model{
	constructor(name, v, vt, vn, vc, material){
		this.name = name;
		this.vertices = new Float32Array(v);
		this.texCoordinates = new Float32Array(vt);
		this.normals = new Float32Array(vn);
		this.vertexCount = vc;
		this.offset = 0;
		this.material = material;
	}
}

function makeCube(x, y, z){
	x = x * 0.5;
	y = y * 0.5;
	z = z * 0.5;
	return [
		[ // v
			// Front face
			-x, -y, z, x, -y, z, x, y, z, -x, -y, z, x, y, z, -x, y, z,
			// Back face
			-x, -y, -z, -x, y, -z, x, y, -z, -x, -y, -z, x, y, -z, x, -y, -z,
			// Top face
			-x, y, -z, -x, y, z, x, y, z, -x, y, -z, x, y, z, x, y, -z,
			// Bottom face
			-x, -y, -z, x, -y, -z, x, -y, z, -x, -y, -z, x, -y, z, -x, -y, z,
			// Right face
			x, -y, -z, x, y, -z, x, y, z, x, -y, -z, x, y, z, x, -y, z,
			// Left face
			-x, -y, -z, -x, -y, z, -x, y, z, -x, -y, -z, -x, y, z, -x, y, -z,
		],
		[ // vt
			// Front
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			// Back
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			// Top
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			// Bottom
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			// Right
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
			// Left
			0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		],
		[ // vn
			// Front
			0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
			// Back
			0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
			// Top
			0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
			// Bottom
			0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
			// Right
			1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
			// Left
			-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
		],
		36, // vc
	];
}

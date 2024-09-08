
var cameraPos = new Float32Array([-0.2, -0.4, 0.0, 1.0]);
var cameraRot = new Float32Array([0.0, -Math.PI * 100 / 180, 0.0, 1.0]);


var LightAmbient = new Float32Array([0.3, 0.3, 0.3]);
var LightDirection = new Float32Array([-0.09759000729485333, -0.9759000729485332, -0.19518001458970666]);
var LightColor = new Float32Array([1.0, 1.0, 1.0]);


class Matrix{
	constructor(rows, columns){
		this.row = rows;
		this.col = columns;
		this.el = Array(rows);
		for(let i = 0; i < rows; i++){
			this.el[i] = Array(columns);
			this.el[i].fill(0);
		}
	}
}

let myProjectionMatrix = new Matrix(4, 4);


const webglcanvas = document.querySelector("#glcanvas");
const canvasWidth = webglcanvas.offsetWidth;
const canvasHeight = webglcanvas.offsetHeight;


let fNear = 0.1;
let fFar = 100.0;
let fFov = 45.0;
let fAspectRatio = canvasHeight / canvasWidth;
let fFovRad = 1.0 / Math.tan(fFov * 0.5 / 180.0 * Math.PI);



myProjectionMatrix.el[0][0] = fAspectRatio * fFovRad;
myProjectionMatrix.el[1][1] = fFovRad;
myProjectionMatrix.el[2][2] = fFar / (fFar - fNear)            * -1 ;  //// ????????????
myProjectionMatrix.el[3][2] = (-fFar * fNear) / (fFar - fNear)  * 2;  /// ???????
myProjectionMatrix.el[2][3] = 1.0                              * -1;  /// ??????????????





class Body{
	constructor(position, rotation, model, gl){
		this.position = position;
		this.rotation = rotation;
		this.model = model;
		
		// Create a buffer for the square's positions.
		this.positionBuffer = gl.createBuffer();
		// Select the positionBuffer as the one to apply buffer
		// operations to from here out.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		// Now pass the list of positions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);
		
		this.textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.texCoordinates), gl.STATIC_DRAW);
		
		this.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.normals), gl.STATIC_DRAW);
	}
	
	update(deltaTime){
		return true;
	}
	
	draw(gl, programInfo){
		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		this.setPositionAttribute(gl, programInfo);
		this.setTextureAttribute(gl, programInfo);
		this.setNormalAttribute(gl, programInfo);
		
		// Set the shader uniforms
		gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			new Float32Array([
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				this.position[0], this.position[1], this.position[2], this.position[3],
			])
		);
		gl.uniformMatrix4fv(
			programInfo.uniformLocations.rotationMatrix,
			false,
			new Float32Array([
				Math.cos(this.rotation[0]), 0, -Math.sin(this.rotation[0]), 0,
				0, 1, 0, 0,
				Math.sin(this.rotation[0]), 0, Math.cos(this.rotation[0]), 0,
				0, 0, 0, 1,
			])
		);
		
		// Tell WebGL we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0);

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, this.model.texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
		
		
		
		gl.uniform3fv(programInfo.uniformLocations.VertexColor, this.model.material.Kd);
		
		
		gl.drawArrays(gl.TRIANGLES, this.model.offset, this.model.vertexCount);
	}
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	setPositionAttribute(gl, programInfo){
		const numComponents = 3; // pull out 3 values per iteration
		const type = gl.FLOAT; // the data in the buffer is 32bit floats
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}
	
	// tell webgl how to pull out the texture coordinates from buffer
	setTextureAttribute(gl, programInfo){
		const num = 2; // every coordinate composed of 2 values
		const type = gl.FLOAT; // the data in the buffer is 32-bit float
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set to the next
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			num,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}
	
	// Tell WebGL how to pull out the normals from
	// the normal buffer into the vertexNormal attribute.
	setNormalAttribute(gl, programInfo){
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(
			programInfo.attribLocations.vertexNormal,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
	}
}


class Camera
{
	constructor(FoV, Znear, Zfar, aspectRatio, position = false, rotation = false)
	{
		this.FoV = FoV;
		this.Znear = Znear;
		this.Zfar = Zfar;
		this.aspectRatio = aspectRatio;
		this.FoVratio = Math.tan(FoV * 0.5 / 180.0 * Math.PI);
		this.projection = new F32Matrix(4);
		this.project();
		this.position = F32Vector(4, position);
		this.position[3] = 1.0;
		this.rotation = F32Vector(4, rotation);
		this.rotation[3] = 1.0;
		this.direction = F32Vector(4);
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
		this.rotation[0] = Math.asin(y);
		this.rotation[1] = Math.atan2(-x, -z);
	}
}

class Body{
	constructor(position, rotation, model, gl){
		this.position = position;
		this.rotation = rotation;
		this.model = model;
		
		this.selected = false;
		
		// Load texture
		this.texture = loadTexture(gl, this.model.textureSrc);
		
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
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
		
		
		
		gl.uniform3fv(programInfo.uniformLocations.VertexColor, this.selected ? Material_DEFAULT.Kd : this.model.material.Kd);
		
		
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

function collision_LineTriangle(line, triangle)
{
	const linePoint = F32Vector(3, line[0]);
	const lineDirection = F32Vector(3, line[1]);
	
	const triangleP0 = F32Vector(3, triangle[0]);
	const triangleP1 = F32Vector(3, triangle[1]);
	const triangleP2 = F32Vector(3, triangle[2]);
	
	const triangleSide0 = triangleP0.copy().substract(triangleP1);
	const triangleSide1 = triangleP1.copy().substract(triangleP2);
	const triangleSide2 = triangleP2.copy().substract(triangleP0);
	
	const normal0 = triangleP0.copy().substract(linePoint).cross(triangleSide0);
	const normal1 = triangleP1.copy().substract(linePoint).cross(triangleSide1);
	const normal2 = triangleP2.copy().substract(linePoint).cross(triangleSide2);
	
	if(lineDirection.dot(normal0) > 0 && lineDirection.dot(normal1) > 0 && lineDirection.dot(normal2) > 0 && lineDirection.dot(triangleSide0.copy().cross(triangleSide1)) < 0){
		// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
		const n = triangleSide0.copy().cross(triangleSide1);
		const parallel = lineDirection.copy().dot(n);
		if(parallel != 0){
			return triangleP0.copy().substract(linePoint).dot(n) / parallel;
		}
	}
	return null;
}


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
				...this.position
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
	const linePoint = Vector3(line[0]);
	const lineDirection = Vector3(line[1]).normalize();
	
	const triangleVertex0 = Vector3(triangle[0]);
	const triangleVertex1 = Vector3(triangle[1]);
	const triangleVertex2 = Vector3(triangle[2]);
	
	const triangleSide0 = triangleVertex0.copy().substract(triangleVertex1);
	const triangleSide1 = triangleVertex1.copy().substract(triangleVertex2);
	const triangleSide2 = triangleVertex2.copy().substract(triangleVertex0);
	
	// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
	const planeNormal = triangleSide0.copy().cross(triangleSide1);
	const parallel = lineDirection.dot(planeNormal);
	if(parallel == 0){
		return null;
	}
	const d = triangleVertex0.copy().substract(linePoint).dot(planeNormal) / parallel;
	const intersection = linePoint.copy().add(lineDirection.copy().scale(d));
	
	if(intersection.copy().substract(triangleVertex0).cross(triangleSide0).dot(planeNormal) > 0 && intersection.copy().substract(triangleVertex1).cross(triangleSide1).dot(planeNormal) > 0 && intersection.copy().substract(triangleVertex2).cross(triangleSide2).dot(planeNormal) > 0){
		return d;
	}
	
	return null;
}

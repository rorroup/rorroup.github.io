
class Body{
	constructor(position, rotation, model, gl){
		this.position = position;
		this.rotation = rotation;
		this.model = model;
		
		this.selected = false;
		
		// Load texture
		this.texture = "map_Kd" in model.material ? loadTexture(gl, `asset/${model.material.map_Kd}`) : false;
		// Flip image pixels into the bottom-to-top order that WebGL expects.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
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
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the aVertexPosition attribute.
	setPositionAttribute(gl, programInfo){
		const numComponents = 3; // pull out 3 values per iteration
		const type = gl.FLOAT; // the data in the buffer is 32bit floats
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

		gl.vertexAttribPointer(
			programInfo.attribLocations.aVertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.aVertexPosition);
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
			programInfo.attribLocations.aTextureCoord,
			num,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.aTextureCoord);
	}
	
	// Tell WebGL how to pull out the normals from
	// the normal buffer into the aVertexNormal attribute.
	setNormalAttribute(gl, programInfo){
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(
			programInfo.attribLocations.aVertexNormal,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		gl.enableVertexAttribArray(programInfo.attribLocations.aVertexNormal);
	}
}

class Cloud extends Body
{
	constructor(position, rotation, model, gl)
	{
		super(position, rotation, model, gl);
		this.timeTotal = 0.0;
		this.x0 = this.position.x;
	}
	
	update(deltaTime){
		this.timeTotal += deltaTime;
		this.position.x = -((this.x0 + this.timeTotal / 250.0) % 80.0);
		return true;
	}
}

function collision_LineTriangle(line, triangle)
{
	// Triangular boundary.
	const linePoint = Vector3(line[0]);
	const lineDirection = Vector3(line[1]); // Must be normalized.
	
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

function collision_LineTriangle1(line, triangle)
{
	// Triangular pyramid.
	const linePoint = Vector3(line[0]);
	const lineDirection = Vector3(line[1]); // Must be normalized.
	
	const triangleVertex0 = Vector3(triangle[0]);
	const triangleVertex1 = Vector3(triangle[1]);
	const triangleVertex2 = Vector3(triangle[2]);
	
	const triangleSide0 = triangleVertex0.copy().substract(triangleVertex1);
	const triangleSide1 = triangleVertex1.copy().substract(triangleVertex2);
	const triangleSide2 = triangleVertex2.copy().substract(triangleVertex0);
	
	const normal0 = triangleVertex0.copy().substract(linePoint).cross(triangleSide0);
	const normal1 = triangleVertex1.copy().substract(linePoint).cross(triangleSide1);
	const normal2 = triangleVertex2.copy().substract(linePoint).cross(triangleSide2);
	
	if(lineDirection.dot(normal0) > 0 && lineDirection.dot(normal1) > 0 && lineDirection.dot(normal2) > 0){
		// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
		const planeNormal = triangleSide0.copy().cross(triangleSide1);
		const parallel = lineDirection.copy().dot(planeNormal);
		if(parallel != 0){
			return triangleVertex0.copy().substract(linePoint).dot(planeNormal) / parallel;
		}
	}
	return null;
}

function collision_LineTriangle2(line, triangle)
{
	// Triangular prism.
	const linePoint = Vector3(line[0]);
	const lineDirection = Vector3(line[1]); // Must be normalized.
	
	const triangleVertex0 = Vector3(triangle[0]);
	const triangleVertex1 = Vector3(triangle[1]);
	const triangleVertex2 = Vector3(triangle[2]);
	
	const triangleSide0 = triangleVertex0.copy().substract(triangleVertex1);
	const triangleSide1 = triangleVertex1.copy().substract(triangleVertex2);
	const triangleSide2 = triangleVertex2.copy().substract(triangleVertex0);
	
	const normal0 = lineDirection.copy().cross(triangleSide0);
	const normal1 = lineDirection.copy().cross(triangleSide1);
	const normal2 = lineDirection.copy().cross(triangleSide2);
	
	if(linePoint.copy().substract(triangleVertex0).dot(normal0) > 0 && linePoint.copy().substract(triangleVertex1).dot(normal1) > 0 && linePoint.copy().substract(triangleVertex2).dot(normal2) > 0){
		// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
		const planeNormal = triangleSide0.copy().cross(triangleSide1);
		const parallel = lineDirection.copy().dot(planeNormal);
		if(parallel != 0){
			return triangleVertex0.copy().substract(linePoint).dot(planeNormal) / parallel;
		}
	}
	return null;
}


function draw_vertexColor(gl, programInfo, camera, light, body, skybox){
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraRotation,
		false,
		camera.rotation
	);
	
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.uLightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.uLightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.uLightColor, new Float32Array(light.directional.color));
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the aVertexPosition attribute.
	body.setPositionAttribute(gl, programInfo);
	body.setNormalAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexTranslation,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...body.position
		])
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexRotation,
		false,
		new Float32Array([
			Math.cos(body.rotation[0]), 0, -Math.sin(body.rotation[0]), 0,
			0, 1, 0, 0,
			Math.sin(body.rotation[0]), 0, Math.cos(body.rotation[0]), 0,
			0, 0, 0, 1,
		])
	);
	
	
	gl.uniform3fv(programInfo.uniformLocations.uVertexColor, body.model.material.Kd);
	
	gl.uniform3fv(programInfo.uniformLocations.uSelected, body.selected ? new Float32Array([0.2, 0.2, 0.2]) : new Float32Array([0.0, 0.0, 0.0]));
	
	gl.drawArrays(gl.TRIANGLES, body.model.offset, body.model.vertexCount);
}

function draw_texture(gl, programInfo, camera, light, body, skybox){
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraRotation,
		false,
		camera.rotation
	);
	
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.uLightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.uLightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.uLightColor, new Float32Array(light.directional.color));
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the aVertexPosition attribute.
	body.setPositionAttribute(gl, programInfo);
	body.setTextureAttribute(gl, programInfo);
	body.setNormalAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexTranslation,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...body.position
		])
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexRotation,
		false,
		new Float32Array([
			Math.cos(body.rotation[0]), 0, -Math.sin(body.rotation[0]), 0,
			0, 1, 0, 0,
			Math.sin(body.rotation[0]), 0, Math.cos(body.rotation[0]), 0,
			0, 0, 0, 1,
		])
	);
	
	
	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, body.texture);

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	
	gl.uniform3fv(programInfo.uniformLocations.uSelected, body.selected ? new Float32Array([0.2, 0.2, 0.2]) : new Float32Array([0.0, 0.0, 0.0]));
	
	gl.drawArrays(gl.TRIANGLES, body.model.offset, body.model.vertexCount);
}

function draw_outline(gl, programInfo, relativeSize, screenSize, attribBuffer, targetTexture)
{
	// Clear the canvas AND the depth buffer.
	// gl.clearColor(1, 0, 1, 1);   // clear to magenta
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);
	
	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);
	
	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	
	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	
	gl.uniform4fv(programInfo.uniformLocations.uOutlineColor, new Float32Array([1.0, 1.0, 1.0, 1.0]));
	gl.uniform1f(programInfo.uniformLocations.uOutlineSize, 3.0);
	gl.uniform2fv(programInfo.uniformLocations.uTextureSize, new Float32Array(screenSize));
	
	{
		const numComponents = 2; // pull out 2 values per iteration
		const type = gl.FLOAT; // the data in the buffer is 32bit floats
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer[0]);
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
	
	{
		const num = 2; // every coordinate composed of 2 values
		const type = gl.FLOAT; // the data in the buffer is 32-bit float
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set to the next
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer[1]);
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.0, relativeSize[1], relativeSize[0], relativeSize[1], relativeSize[0], 0.0]), gl.STATIC_DRAW);
		
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
	
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function draw_silhouette(gl, programInfo, camera, bodySelected){
	gl.clearColor(0.0, 0.0, 0.0, 0.0); // Background color
	gl.clearDepth(1.0); // Clear everything
	
	// Clear the canvas before we start drawing on it.
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);
	
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uProjectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uCameraRotation,
		false,
		camera.rotation
	);
	
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the aVertexPosition attribute.
	bodySelected.setPositionAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexTranslation,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...bodySelected.position
		])
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.uVertexRotation,
		false,
		new Float32Array([
			Math.cos(bodySelected.rotation[0]), 0, -Math.sin(bodySelected.rotation[0]), 0,
			0, 1, 0, 0,
			Math.sin(bodySelected.rotation[0]), 0, Math.cos(bodySelected.rotation[0]), 0,
			0, 0, 0, 1,
		])
	);
	
	gl.drawArrays(gl.TRIANGLES, bodySelected.model.offset, bodySelected.model.vertexCount);
}

function draw_Figure3D_lines(gl, programInfo, camera, lines, color, num)
{
	gl.uniform4fv(programInfo.uniformLocations.uVertexColor, new Float32Array(color));
	
	// aVertexPosition
	gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.AttributeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
	gl.vertexAttribPointer(programInfo.attribLocations.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attribLocations.aVertexPosition);
	
	gl.drawArrays(gl.LINES, 0, num);
}

function draw_Figure3D_planes(gl, programInfo, plane)
{
	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, plane.i);
	
	// aVertexPosition
	gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.AttributeBuffer[0]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.v), gl.STATIC_DRAW);
	gl.vertexAttribPointer(programInfo.attribLocations.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attribLocations.aVertexPosition);
	
	// aTextureCoord
	gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.AttributeBuffer[1]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.t), gl.STATIC_DRAW);
	gl.vertexAttribPointer(programInfo.attribLocations.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(programInfo.attribLocations.aTextureCoord);
	
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

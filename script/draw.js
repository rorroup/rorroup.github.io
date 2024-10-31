
function draw_vertexColor(gl, programInfo, camera, light, body, skybox){
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraRotation,
		false,
		camera.rotation
	);
	
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.LightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.LightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.LightColor, new Float32Array(light.directional.color));
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	body.setPositionAttribute(gl, programInfo);
	body.setTextureAttribute(gl, programInfo);
	body.setNormalAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...body.position
		])
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.rotationMatrix,
		false,
		new Float32Array([
			Math.cos(body.rotation[0]), 0, -Math.sin(body.rotation[0]), 0,
			0, 1, 0, 0,
			Math.sin(body.rotation[0]), 0, Math.cos(body.rotation[0]), 0,
			0, 0, 0, 1,
		])
	);
	
	
	gl.uniform3fv(programInfo.uniformLocations.VertexColor, body.model.material.Kd);
	
	gl.uniform3fv(programInfo.uniformLocations.selected, body.selected ? new Float32Array([0.2, 0.2, 0.2]) : new Float32Array([0.0, 0.0, 0.0]));
	
	gl.drawArrays(gl.TRIANGLES, body.model.offset, body.model.vertexCount);
}

function draw_texture(gl, programInfo, camera, light, body, skybox){
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraRotation,
		false,
		camera.rotation
	);
	
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.LightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.LightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.LightColor, new Float32Array(light.directional.color));
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	body.setPositionAttribute(gl, programInfo);
	body.setTextureAttribute(gl, programInfo);
	body.setNormalAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...body.position
		])
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.rotationMatrix,
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
	
	gl.uniform3fv(programInfo.uniformLocations.selected, body.selected ? new Float32Array([0.2, 0.2, 0.2]) : new Float32Array([0.0, 0.0, 0.0]));
	
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
	
	gl.uniform4fv(programInfo.uniformLocations.outlineColor, new Float32Array([1.0, 1.0, 1.0, 1.0]));
	gl.uniform1f(programInfo.uniformLocations.outlineSize, 3.0);
	gl.uniform2fv(programInfo.uniformLocations.textureSize, new Float32Array(screenSize));
	
	{
		const numComponents = 2; // pull out 2 values per iteration
		const type = gl.FLOAT; // the data in the buffer is 32bit floats
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set of values to the next
		// 0 = use type and numComponents above
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer[0]);
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
	
	{
		const num = 2; // every coordinate composed of 2 values
		const type = gl.FLOAT; // the data in the buffer is 32-bit float
		const normalize = false; // don't normalize
		const stride = 0; // how many bytes to get from one set to the next
		const offset = 0; // how many bytes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, attribBuffer[1]);
		
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				0.0, 0.0, relativeSize[0], 0.0, relativeSize[0], relativeSize[1],
				0.0, 0.0, relativeSize[0], relativeSize[1], 0.0, relativeSize[1]
			]),
			gl.STATIC_DRAW,
		);
		
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
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
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
		programInfo.uniformLocations.projectionMatrix,
		false,
		camera.projection
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraPosition,
		false,
		camera.position
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraRotation,
		false,
		camera.rotation
	);
	
	
	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	bodySelected.setPositionAttribute(gl, programInfo);
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			...bodySelected.position
		])
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.rotationMatrix,
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

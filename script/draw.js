
function draw_vertexColor(gl, programInfo, camera, light, bodies, skybox){
	const body = bodies;
	
	const mProjection = camera.projection;
	const cameraPos = [-camera.position[0], -camera.position[1], -camera.position[2], 1.0];
	const cameraRot = [-camera.rotation[0], -camera.rotation[1], -camera.rotation[2], 1.0];
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		new Float32Array(mProjection)
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraPosition,
		false,
		new Float32Array([
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			...cameraPos
		])
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraRotation,
		false,
		new Float32Array([
			Math.cos(cameraRot[1]), Math.sin(cameraRot[1]) * Math.sin(cameraRot[0]), -Math.sin(cameraRot[1]) * Math.cos(cameraRot[0]), 0.0,
			0.0, Math.cos(cameraRot[0]), Math.sin(cameraRot[0]), 0.0,
			Math.sin(cameraRot[1]), -Math.cos(cameraRot[1]) * Math.sin(cameraRot[0]), Math.cos(cameraRot[1]) * Math.cos(cameraRot[0]), 0.0,
			0.0, 0.0, 0.0, 1.0,
		])
	);
	
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.LightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.LightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.LightColor, new Float32Array(light.directional.color));
	
	//bodies.forEach((body) => {
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
	//});
}

function draw_texture(gl, programInfo, camera, light, bodies, skybox){
	const body = bodies;
	
	const mProjection = camera.projection;
	const cameraPos = [-camera.position[0], -camera.position[1], -camera.position[2], 1.0];
	const cameraRot = [-camera.rotation[0], -camera.rotation[1], -camera.rotation[2], 1.0];
	
	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		new Float32Array(mProjection)
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraPosition,
		false,
		new Float32Array([
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			...cameraPos
		])
	);
	
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.cameraRotation,
		false,
		new Float32Array([
			Math.cos(cameraRot[1]), Math.sin(cameraRot[1]) * Math.sin(cameraRot[0]), -Math.sin(cameraRot[1]) * Math.cos(cameraRot[0]), 0.0,
			0.0, Math.cos(cameraRot[0]), Math.sin(cameraRot[0]), 0.0,
			Math.sin(cameraRot[1]), -Math.cos(cameraRot[1]) * Math.sin(cameraRot[0]), Math.cos(cameraRot[1]) * Math.cos(cameraRot[0]), 0.0,
			0.0, 0.0, 0.0, 1.0,
		])
	);
	/*
	// Pass Lighting conditions
	gl.uniform3fv(programInfo.uniformLocations.LightAmbient, new Float32Array(light.diffuse));
	gl.uniform3fv(programInfo.uniformLocations.LightDirection, new Float32Array(light.directional.direction));
	gl.uniform3fv(programInfo.uniformLocations.LightColor, new Float32Array(light.directional.color));
	*/
	//bodies.forEach((body) => {
		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute.
		body.setPositionAttribute(gl, programInfo);
		body.setTextureAttribute(gl, programInfo);
		// body.setNormalAttribute(gl, programInfo);
		
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
		
		// gl.uniform3fv(programInfo.uniformLocations.selected, body.selected ? new Float32Array([0.2, 0.2, 0.2]) : new Float32Array([0.0, 0.0, 0.0]));
		
		gl.drawArrays(gl.TRIANGLES, body.model.offset, body.model.vertexCount);
	//});
}

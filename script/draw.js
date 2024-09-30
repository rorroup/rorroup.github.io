
function drawScene(gl, programInfo, camera, Light, bodies, timeDelta){
	gl.clearColor(0.0, 1.0, 7.0, 1.0); // Background color
	gl.clearDepth(1.0); // Clear everything
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.depthFunc(gl.LEQUAL); // Near things obscure far things
	
	// Clear the canvas before we start drawing on it.
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);
	
	
	const mProjection = camera.projection;
	const cameraPos = camera.position;
	const cameraRot = camera.rotation;
	
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
			cameraPos[0], cameraPos[1], cameraPos[2], 1.0,
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
	gl.uniform3fv(programInfo.uniformLocations.LightAmbient, Light.Ambient);
	gl.uniform3fv(programInfo.uniformLocations.LightDirection, Light.Direction);
	gl.uniform3fv(programInfo.uniformLocations.LightColor, Light.Color);
	
	bodies.forEach((body) => {body.update(timeDelta);});
	bodies.forEach((body) => {body.draw(gl, programInfo);});
}



function drawScene(gl, programInfo, bodies, timeDelta) {
  gl.clearColor(0.0, 1.0, 7.0, 1.0); // Background color
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);
  

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    new Float32Array(myProjectionMatrix.el[0].concat(myProjectionMatrix.el[1]).concat(myProjectionMatrix.el[2]).concat(myProjectionMatrix.el[3]))
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
  gl.uniform3fv(programInfo.uniformLocations.LightAmbient, LightAmbient);
  gl.uniform3fv(programInfo.uniformLocations.LightDirection, LightDirection);
  gl.uniform3fv(programInfo.uniformLocations.LightColor, LightColor);
  
  bodies.forEach((body) => {body.update(timeDelta);});
  
  bodies.forEach((body) => {body.draw(gl, programInfo);});
  
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3; // pull out 3 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  
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
function setTextureAttribute(gl, buffers, programInfo) {
  const num = 2; // every coordinate composed of 2 values
  const type = gl.FLOAT; // the data in the buffer is 32-bit float
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set to the next
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
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
function setNormalAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
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


export { drawScene };

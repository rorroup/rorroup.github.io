// start here
function main(){
	const canvas = document.querySelector("#glcanvas");
	// Initialize the GL context
	const gl = canvas.getContext("webgl");
	
	// Only continue if WebGL is available and working
	if(gl === null){
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}
	
	Promise.all([
		fetch("script/shader/vertexColor.vs"),
		fetch("script/shader/vertexColor.fs"),
	]).then((responses) => {
		responses.forEach((response) => {
			if(!response.ok){
				throw new Error(`Response status: ${response.status}`);
			}
		});
		[vs, fs] = responses;
		return Promise.all([
			vs.text(),
			fs.text(),
		]);
	}).then((shaders) => {
		[vsSource, fsSource] = shaders;
		
		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
		
		if(shaderProgram === null){
			return;
		}
		
		// Collect all the info needed to use the shader program.
		// Look up which attribute our shader program is using
		// for aVertexPosition and look up uniform locations.
		const Animated = {
			canvas: canvas,
			gl: gl,
			glProgramInfo_vertexColor: {
				program: shaderProgram,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
					vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
					textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
				},
				uniformLocations: {
					projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
					modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
					rotationMatrix: gl.getUniformLocation(shaderProgram, "uRotationMatrix"),
					cameraPosition: gl.getUniformLocation(shaderProgram, "uCameraPosition"),
					cameraRotation: gl.getUniformLocation(shaderProgram, "uCameraRotation"),
					uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
					VertexColor: gl.getUniformLocation(shaderProgram, "uVertexColor"),
					LightAmbient: gl.getUniformLocation(shaderProgram, "uLightAmbient"),
					LightDirection: gl.getUniformLocation(shaderProgram, "uLightDirection"),
					LightColor: gl.getUniformLocation(shaderProgram, "uLightColor"),
					selected: gl.getUniformLocation(shaderProgram, "uSelected"),
				},
			},
			canvasSize: Vector2([canvas.offsetWidth, canvas.offsetHeight]),
			camera: new Camera(45.0, 0.1, 100.0, canvas.offsetHeight / canvas.offsetWidth, [0.2, -0.4, -1.2, 1.0], [0.0, -Math.PI * 90 / 180, 0.0, 1.0]),
			cameraThreshold: [],
			lightGlobal: {
				diffuse: Vector3(),
				directional: {
					direction: Vector3(),
					color: Vector3(),
				},
			},
			skybox: Vector3(),
			cycleDayNight: 6000,
			scenery: [],
			bodies: [],
			selected: false,
			modelLoad(models, container){
				for(let i = 0; i < models.length; i++){
					container.push(new Body(Vector4(pen_Matrix.W1), Vector4(pen_Matrix.W1), models[i], this.gl));
				}
			},
			resize(){
				this.canvasSize.set([this.canvas.offsetWidth, this.canvas.offsetHeight]);
				
				// Update canvas size.
				this.canvas.width = this.canvasSize.x;
				this.canvas.height = this.canvasSize.y;
				
				// Apply viewport resolution.
				this.gl.viewport(0, 0, this.canvasSize.x, this.canvasSize.y);
				
				// Adjust horizontal and vertical camera direction ranges.
				this.cameraThreshold = [Math.PI * (37 + 32 * ((this.canvasSize.y / this.canvasSize.x) - (9 / 16))) / 180, Math.PI * (35 - 22 * ((this.canvasSize.y / this.canvasSize.x) - (9 / 16))) / 180];
				
				// Move camera position.
				this.camera.position.x = 0.0 - 0.8 * ((this.canvasSize.y / this.canvasSize.x) - (9 / 16));
				
				// Update projection matrix.
				this.camera.aspectRatio = this.canvasSize.y / this.canvasSize.x;
				this.camera.project();
			},
			update(){
				// Day-Night cycle
				this.lightGlobal.diffuse.fill(0.2 + 2 * 0.1 * Math.abs(((this.timeFrameCurrent % (this.cycleDayNight * 2 * Math.PI)) / (this.cycleDayNight * 2 * Math.PI)) - 0.5));
				
				this.lightGlobal.directional.direction.set([8.0 - 10.0 * (((this.timeFrameCurrent + this.cycleDayNight * Math.PI) % (this.cycleDayNight * 2 * Math.PI)) / (this.cycleDayNight * 2 * Math.PI)), -10.0, -2.0]).normalize();
				this.lightGlobal.directional.color.fill(0.2 + 2 * 0.8 * Math.abs(((this.timeFrameCurrent % (this.cycleDayNight * 2 * Math.PI)) / (this.cycleDayNight * 2 * Math.PI)) - 0.5));
				
				this.skybox.x = 0.50 - 0.50 * Math.cos(this.timeFrameCurrent / this.cycleDayNight * 2); // r
				this.skybox.y = 0.45 + 0.45 * Math.cos(this.timeFrameCurrent / this.cycleDayNight); // g
				this.skybox.z = 0.55 + 0.45 * Math.cos(this.timeFrameCurrent / this.cycleDayNight); // b
				
				
				this.scenery.forEach((body) => {body.update(this.deltaTime);});
				this.bodies.forEach((body) => {body.update(this.deltaTime);});
			},
			draw(){
				
				
				  {
    // render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.canvasSize.x , this.canvasSize.y);
	this.camera.aspectRatio = this.canvasSize.y / this.canvasSize.x;
	this.camera.project();
				
				drawScene(this.gl, this.glProgramInfo_vertexColor, this.camera, this.lightGlobal, this.scenery.concat(this.bodies), this.skybox);
				  }
				  
				  
				    if(this.selected != false){
	// render to our targetTexture by binding the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
 
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
	this.camera.aspectRatio = targetTextureHeight / targetTextureWidth;
	this.camera.project();
	
	drawSilhouette(this.gl, glProgramInfoSilhouette, this.camera, this.selected);
	
	
	// render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.canvasSize.x , this.canvasSize.y);
	this.camera.aspectRatio = this.canvasSize.y / this.canvasSize.x;
	this.camera.project();
	
	DRAW_TEX_TO_SCREEN(positionBuffer, textureCoordBuffer, shaderProgram2, glProgramInfo2, this.gl, targetTexture, targetTextureWidth, targetTextureHeight);
  }
			},
		};
		
		// Here's where we call the routine that builds all the
		// objects we'll be drawing.
		fetch("asset/bodies.obj").then((response) => {
			if(!response.ok){
				throw new Error(`Response status: ${response.status}`);
			}
			return response.text();
		}).then((text) =>
			pen_obj.obj_load(text)
		).then((loaded) => {
			Animated.modelLoad(loaded, Animated.bodies);
		}).catch((e) => {
			console.error(e);
		});
		
		fetch("asset/scenery.obj").then((response) => {
			if(!response.ok){
				throw new Error(`Response status: ${response.status}`);
			}
			return response.text();
		}).then((text) =>
			pen_obj.obj_load(text)
		).then((loaded) => {
			Animated.modelLoad(loaded, Animated.scenery);
		}).catch((e) => {
			console.error(e);
		});
		
		Animated.resize();
		window.addEventListener("resize", () => {Animated.resize();});
		
		const hover = document.getElementById("hover");
		canvas.addEventListener("mousemove", function(event_){
			let mouseX = event_.offsetX;
			let mouseY = event_.offsetY;
			
			Animated.camera.rotate([(mouseY / Animated.canvasSize.y - 0.5) * Animated.cameraThreshold[1], -Math.PI * 90 / 180 + (mouseX / Animated.canvasSize.x - 0.5) * Animated.cameraThreshold[0], 0.0, 1.0]);
			
			const campos = Vector3([-Animated.camera.position.x, -Animated.camera.position.y, -Animated.camera.position.z]);
			const camdir = Vector3([-Animated.camera.direction.x, -Animated.camera.direction.y, Animated.camera.direction.z]);
			
			let vecRight = camdir.copy().cross(pen_Matrix.Y1).normalize();
			let vecUpwards = vecRight.copy().cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
			
			let cam2mouse = camdir.copy().scale(Animated.camera.Znear).add(vecRight.copy().scale(2 * (Animated.canvasSize.x / Animated.canvasSize.y) * Animated.camera.Znear * Animated.camera.FoVratio * ((mouseX - Animated.canvasSize.x / 2) / Animated.canvasSize.x))).add(vecUpwards.copy().scale(2 * Animated.camera.Znear * Animated.camera.FoVratio * ((Animated.canvasSize.y / 2 - mouseY) / Animated.canvasSize.y)));
			let mouse3d = campos.copy().add(cam2mouse);
			
			let cam2mouseNormalized = cam2mouse.copy().normalize();
			
			let intersections = [];
			
			for(let i = 0; i < Animated.bodies.length; i++){
				let body = Animated.bodies[i];
				body.selected = false;
				for(let j = 0; j < body.model.vertexCount / 3; j++){
					const d = collision_LineTriangle(
						[campos, cam2mouse],
						[
							body.model.vertices.subarray(9 * j + 0, 9 * j + 3),
							body.model.vertices.subarray(9 * j + 3, 9 * j + 6),
							body.model.vertices.subarray(9 * j + 6, 9 * j + 9),
						]
					);
					
					if(d != null){
						if(d > 0){
							intersections.push([i, d]);
							// let intersection = campos.copy().add(cam2mouse.copy().scale(d));
							break;
						}
					}
				}
			}
			
			hover.style.display = "none";
			Animated.selected = false;
			
			if(intersections.length > 0){
				intersections.sort((a, b) => {return a[1] - b[1];});
				Animated.bodies[intersections[0][0]].selected = true;
				Animated.selected = Animated.bodies[intersections[0][0]];
				
				hover.style.display = "block";
				hover.textContent = Animated.bodies[intersections[0][0]].model.name;
				hover.style.left = (mouseX - 20).toString() + "px";
				hover.style.bottom = (Animated.canvasSize.y - mouseY + 20).toString() + "px";
			}
		});
		
		// Flip image pixels into the bottom-to-top order that WebGL expects.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		
		const vsSilhouette = `
		attribute vec4 aVertexPosition;
		
		uniform mat4 uRotationMatrix;
		uniform mat4 uModelViewMatrix;
		
		uniform mat4 uCameraPosition;
		uniform mat4 uCameraRotation;
		uniform mat4 uProjectionMatrix;
		
		void main(){
			gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uModelViewMatrix * uRotationMatrix * aVertexPosition;
		}
		`;
		
		const fsSilhouette = `
		void main(){
			gl_FragColor = vec4(1.0);
		}
		`;
		
		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgramSilhouette = initShaderProgram(gl, vsSilhouette, fsSilhouette);
		
		if(shaderProgramSilhouette === null){
			return;
		}
		
		const glProgramInfoSilhouette = {
			program: shaderProgramSilhouette,
			attribLocations: {
				vertexPosition: gl.getAttribLocation(shaderProgramSilhouette, "aVertexPosition"),
			},
			uniformLocations: {
				projectionMatrix: gl.getUniformLocation(shaderProgramSilhouette, "uProjectionMatrix"),
				modelViewMatrix: gl.getUniformLocation(shaderProgramSilhouette, "uModelViewMatrix"),
				rotationMatrix: gl.getUniformLocation(shaderProgramSilhouette, "uRotationMatrix"),
				cameraPosition: gl.getUniformLocation(shaderProgramSilhouette, "uCameraPosition"),
				cameraRotation: gl.getUniformLocation(shaderProgramSilhouette, "uCameraRotation"),
			},
		};
		
		
		// Vertex shader program
const vsSource2 = `
    attribute vec4 aVertexPosition;
	attribute vec2 aTextureCoord;
	
	varying highp vec2 vTextureCoord;
	
    void main() {
      gl_Position = vec4(aVertexPosition.xy, -1.0, 1.0);
	  vTextureCoord = aTextureCoord;
    }
  `;
		
		const fsSource2 = `
		uniform sampler2D uSampler;
		varying highp vec2 vTextureCoord;
		
		uniform highp vec2 uTextureSize;
		
		uniform lowp vec4 uOutlineColor;
		uniform lowp float uOutlineSize;
		
    void main(void) {
		lowp vec2 texelScale = vec2(uOutlineSize, uOutlineSize) / uTextureSize;
		
		lowp vec4 texel = texture2D(uSampler, vTextureCoord);   // Get texel color
		
		lowp vec4 sides = vec4(0.0);
    sides.x = texture2D(uSampler, vTextureCoord + vec2(0, texelScale.y)).a;
    sides.y = texture2D(uSampler, vTextureCoord + vec2(0, -texelScale.y)).a;
    sides.z = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, 0)).a;
    sides.w = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, 0)).a;
		
			lowp vec4 corners = vec4(0.0);
    corners.x = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, texelScale.y)).a;
    corners.y = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, -texelScale.y)).a;
    corners.z = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, texelScale.y)).a;
    corners.w = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, -texelScale.y)).a;
	
	if(texel.a == 0.0 && dot(sides + corners, vec4(1.0)) > 0.0 ){
    gl_FragColor = uOutlineColor;
		}
		else{
			discard;
		}
    }
  `;

		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgram2 = initShaderProgram(gl, vsSource2, fsSource2);
		
		if(shaderProgram2 === null){
			return;
		}
		
		const glProgramInfo2 = {
			attribLocations: {
				vertexPosition: gl.getAttribLocation(shaderProgram2, "aVertexPosition"),
				textureCoord: gl.getAttribLocation(shaderProgram2, "aTextureCoord"),
			},
			uniformLocations: {
				uSampler: gl.getUniformLocation(shaderProgram2, "uSampler"),
				textureSize: gl.getUniformLocation(shaderProgram2, "uTextureSize"),
				outlineColor: gl.getUniformLocation(shaderProgram2, "uOutlineColor"),
				outlineSize: gl.getUniformLocation(shaderProgram2, "uOutlineSize"),
			},
		};
		
		    // create to render to
    const targetTextureWidth = canvas.offsetWidth;
    const targetTextureHeight = canvas.offsetHeight;
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
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
		
		// Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  const positions = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		
		
		const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
	0.0, 0.0, 1.0, 1.0, 0.0, 1.0
  ];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    gl.STATIC_DRAW,
  );
		
		
		// Draw the scene repeatedly
		function Animated_Play(){
			// Update
			this.deltaTime = this.timeFrameCurrent - this.timeFrameLast;
			this.update();
			
			// Draw
			this.draw();
		}
		animation_initAnimationComponent(Animated, Animated_Play);
		
	}).catch((e) => {
		console.error(e);
	});
}


main();

function DRAW_TEX_TO_SCREEN(squareBuffer, squareTexel, shaderProgram2, programInfo, gl, targetTexture, targetTextureWidth, targetTextureHeight)
{
	// Clear the canvas AND the depth buffer.
    // gl.clearColor(1, 0, 1, 1);   // clear to magenta
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Tell WebGL to use our program when drawing
	gl.useProgram(shaderProgram2);
	
	// Tell WebGL we want to affect texture unit 0
gl.activeTexture(gl.TEXTURE0);

// Bind the texture to texture unit 0
gl.bindTexture(gl.TEXTURE_2D, targetTexture);

// Tell the shader we bound the texture to texture unit 0
gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	gl.uniform4fv(programInfo.uniformLocations.outlineColor, new Float32Array([1.0, 1.0, 1.0, 1.0]));
	gl.uniform1f(programInfo.uniformLocations.outlineSize, 3.0);
	gl.uniform2fv(programInfo.uniformLocations.textureSize, new Float32Array([targetTextureWidth, targetTextureHeight]));
	
	{
	const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
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
  gl.bindBuffer(gl.ARRAY_BUFFER, squareTexel);
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



function drawSilhouette(gl, programInfo, camera, bodySelected){
	gl.clearColor(0.0, 0.0, 0.0, 0.0); // Background color
	gl.clearDepth(1.0); // Clear everything
	
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

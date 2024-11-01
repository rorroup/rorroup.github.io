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
		Promise.all([
			fetch("script/shader/vertexColor.vs"),
			fetch("script/shader/vertexColor.fs"),
		]),
		Promise.all([
			fetch("script/shader/texture.vs"),
			fetch("script/shader/texture.fs"),
		]),
		Promise.all([
			fetch("script/shader/silhouette.vs"),
			fetch("script/shader/silhouette.fs"),
		]),
		Promise.all([
			fetch("script/shader/outline.vs"),
			fetch("script/shader/outline.fs"),
		]),
	]).then((responses) => {
		responses.forEach((response) => {
			response.forEach((shaderFile) => {
				if(!shaderFile.ok){
					throw new Error(`Response status: ${shaderFile.status}`);
				}
			});
		});
		[vertexColor, texture, silhouette, outline] = responses;
		return Promise.all([
			Promise.all([
				vertexColor[0].text(),
				vertexColor[1].text(),
			]),
			Promise.all([
				texture[0].text(),
				texture[1].text(),
			]),
			Promise.all([
				silhouette[0].text(),
				silhouette[1].text(),
			]),
			Promise.all([
				outline[0].text(),
				outline[1].text(),
			]),
		]);
	}).then((shaders) => {
		[vertexColor, texture, silhouette, outline] = shaders;
		
		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		const shaderProgram_vertexColor = initShaderProgram(gl, vertexColor[0], vertexColor[1]);
		
		if(shaderProgram_vertexColor === null){
			return;
		}
		
		const shaderProgram_texture = initShaderProgram(gl, texture[0], texture[1]);
		
		if(shaderProgram_texture === null){
			return;
		}
		
		const shaderProgram_silhouette = initShaderProgram(gl, silhouette[0], silhouette[1]);
		
		if(shaderProgram_silhouette === null){
			return;
		}
		
		const shaderProgram_outline = initShaderProgram(gl, outline[0], outline[1]);
		
		if(shaderProgram_outline === null){
			return;
		}
		
		// Collect all the info needed to use the shader program.
		// Look up which attribute our shader program is using
		// for aVertexPosition and look up uniform locations.
		const Animated = {
			canvas: canvas,
			gl: gl,
			glProgramInfo_vertexColor: {
				program: shaderProgram_vertexColor,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram_vertexColor, "aVertexPosition"),
					vertexNormal: gl.getAttribLocation(shaderProgram_vertexColor, "aVertexNormal"),
					textureCoord: gl.getAttribLocation(shaderProgram_vertexColor, "aTextureCoord"),
				},
				uniformLocations: {
					projectionMatrix: gl.getUniformLocation(shaderProgram_vertexColor, "uProjectionMatrix"),
					modelViewMatrix: gl.getUniformLocation(shaderProgram_vertexColor, "uModelViewMatrix"),
					rotationMatrix: gl.getUniformLocation(shaderProgram_vertexColor, "uRotationMatrix"),
					cameraPosition: gl.getUniformLocation(shaderProgram_vertexColor, "uCameraPosition"),
					cameraRotation: gl.getUniformLocation(shaderProgram_vertexColor, "uCameraRotation"),
					VertexColor: gl.getUniformLocation(shaderProgram_vertexColor, "uVertexColor"),
					LightAmbient: gl.getUniformLocation(shaderProgram_vertexColor, "uLightAmbient"),
					LightDirection: gl.getUniformLocation(shaderProgram_vertexColor, "uLightDirection"),
					LightColor: gl.getUniformLocation(shaderProgram_vertexColor, "uLightColor"),
					selected: gl.getUniformLocation(shaderProgram_vertexColor, "uSelected"),
				},
			},
			glProgramInfo_texture: {
				program: shaderProgram_texture,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram_texture, "aVertexPosition"),
					vertexNormal: gl.getAttribLocation(shaderProgram_texture, "aVertexNormal"),
					textureCoord: gl.getAttribLocation(shaderProgram_texture, "aTextureCoord"),
				},
				uniformLocations: {
					projectionMatrix: gl.getUniformLocation(shaderProgram_texture, "uProjectionMatrix"),
					modelViewMatrix: gl.getUniformLocation(shaderProgram_texture, "uModelViewMatrix"),
					rotationMatrix: gl.getUniformLocation(shaderProgram_texture, "uRotationMatrix"),
					cameraPosition: gl.getUniformLocation(shaderProgram_texture, "uCameraPosition"),
					cameraRotation: gl.getUniformLocation(shaderProgram_texture, "uCameraRotation"),
					uSampler: gl.getUniformLocation(shaderProgram_texture, "uSampler"),
					LightAmbient: gl.getUniformLocation(shaderProgram_texture, "uLightAmbient"),
					LightDirection: gl.getUniformLocation(shaderProgram_texture, "uLightDirection"),
					LightColor: gl.getUniformLocation(shaderProgram_texture, "uLightColor"),
					selected: gl.getUniformLocation(shaderProgram_texture, "uSelected"),
				},
			},
			glProgramInfo_silhouette: {
				program: shaderProgram_silhouette,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram_silhouette, "aVertexPosition"),
				},
				uniformLocations: {
					projectionMatrix: gl.getUniformLocation(shaderProgram_silhouette, "uProjectionMatrix"),
					modelViewMatrix: gl.getUniformLocation(shaderProgram_silhouette, "uModelViewMatrix"),
					rotationMatrix: gl.getUniformLocation(shaderProgram_silhouette, "uRotationMatrix"),
					cameraPosition: gl.getUniformLocation(shaderProgram_silhouette, "uCameraPosition"),
					cameraRotation: gl.getUniformLocation(shaderProgram_silhouette, "uCameraRotation"),
				},
			},
			glProgramInfo_outline: {
				program: shaderProgram_outline,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shaderProgram_outline, "aVertexPosition"),
					textureCoord: gl.getAttribLocation(shaderProgram_outline, "aTextureCoord"),
				},
				uniformLocations: {
					uSampler: gl.getUniformLocation(shaderProgram_outline, "uSampler"),
					textureSize: gl.getUniformLocation(shaderProgram_outline, "uTextureSize"),
					outlineColor: gl.getUniformLocation(shaderProgram_outline, "uOutlineColor"),
					outlineSize: gl.getUniformLocation(shaderProgram_outline, "uOutlineSize"),
				},
			},
			canvasSize: Vector2([canvas.offsetWidth, canvas.offsetHeight]),
			screenSize: [parseInt(window.screen.width), parseInt(window.screen.height)],
			relativeSize: [1.0, 1.0],
			silhouetteFramebuffer: createFramebuffer(gl, [parseInt(window.screen.width), parseInt(window.screen.height)]),
			silhouetteAttributeBuffer: [gl.createBuffer(), gl.createBuffer()],
			camera: new Camera(45.0, 0.1, 100.0, canvas.offsetHeight / canvas.offsetWidth, [0.0, 1.4, 0.5, 1.0], [0.0, 0.0, 0.0, 1.0]),
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
				this.camera.position.z = 0.5 + 0.2 * ((this.canvasSize.y / this.canvasSize.x) - (9 / 16));
				
				// Update projection matrix.
				this.camera.aspectRatio = this.canvasSize.y / this.canvasSize.x;
				this.camera.project();
				
				this.relativeSize = [this.canvasSize.x / this.screenSize[0], this.canvasSize.y / this.screenSize[1]];
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
				// render to the canvas
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				
				gl.clearColor(...this.skybox, 1.0); // Background color
				gl.clearDepth(1.0); // Clear everything
				gl.enable(gl.DEPTH_TEST); // Enable depth testing
				gl.depthFunc(gl.LEQUAL); // Near things obscure far things
				
				// Clear the canvas before we start drawing on it.
				
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				
				// Compute camera uniforms.
				const camera = {
					projection: new Float32Array(this.camera.projection),
					position: new Float32Array([
						1.0, 0.0, 0.0, 0.0,
						0.0, 1.0, 0.0, 0.0,
						0.0, 0.0, 1.0, 0.0,
						-this.camera.position.x, -this.camera.position.y, -this.camera.position.z, 1.0
					]),
					rotation: new Float32Array([
						Math.cos(-this.camera.rotation.y), Math.sin(-this.camera.rotation.y) * Math.sin(-this.camera.rotation.x), -Math.sin(-this.camera.rotation.y) * Math.cos(-this.camera.rotation.x), 0.0,
						0.0, Math.cos(-this.camera.rotation.x), Math.sin(-this.camera.rotation.x), 0.0,
						Math.sin(-this.camera.rotation.y), -Math.cos(-this.camera.rotation.y) * Math.sin(-this.camera.rotation.x), Math.cos(-this.camera.rotation.y) * Math.cos(-this.camera.rotation.x), 0.0,
						0.0, 0.0, 0.0, 1.0,
					]),
				};
				
				this.scenery.concat(this.bodies).forEach((bodyCurrent) => {
					if(bodyCurrent.texture == false){
						// Tell WebGL to use our program when drawing
						gl.useProgram(this.glProgramInfo_vertexColor.program);
						
						draw_vertexColor(this.gl, this.glProgramInfo_vertexColor, camera, this.lightGlobal, bodyCurrent, this.skybox);
					}else{
						// Tell WebGL to use our program when drawing
						gl.useProgram(this.glProgramInfo_texture.program);
						
						draw_texture(this.gl, this.glProgramInfo_texture, camera, this.lightGlobal, bodyCurrent, this.skybox);
					}
				});
				
				
				if(this.selected != false){
					// render to our targetTexture by binding the framebuffer
					gl.bindFramebuffer(gl.FRAMEBUFFER, this.silhouetteFramebuffer.framebuffer);
					
					draw_silhouette(this.gl, this.glProgramInfo_silhouette, camera, this.selected);
					
					// render to the canvas
					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
					
					draw_outline(this.gl, this.glProgramInfo_outline, this.relativeSize, this.screenSize, this.silhouetteAttributeBuffer, this.silhouetteFramebuffer.texture[0]);
				}
			},
		};
		
		{
			const positionBuffer = Animated.silhouetteAttributeBuffer[0];
			
			// Select the positionBuffer as the one to apply buffer
			// operations to from here out.
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			
			// Now create an array of positions for the square.
			const positions = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
			
			// Now pass the list of positions into WebGL to build the
			// shape. We do this by creating a Float32Array from the
			// JavaScript array, then use it to fill the current buffer.
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		}
		
		{
			const textureCoordBuffer = Animated.silhouetteAttributeBuffer[1];
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
		}
		
		// Here's where we call the routine that builds all the
		// objects we'll be drawing.
		fetch("asset/libraryItems.obj").then((response) => {
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
		
		fetch("asset/libraryBG.obj").then((response) => {
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
		
		fetch("asset/libraryCloud.obj").then((response) => {
			if(!response.ok){
				throw new Error(`Response status: ${response.status}`);
			}
			return response.text();
		}).then((text) =>
			pen_obj.obj_load(text)
		).then((loaded) => {
			for(let i = 0; i < loaded.length; i++){
				Animated.scenery.push(new Cloud(Vector4([-25.0 + 4.0 * i, 20.0 - 2.0 * i, -70.0 + 3.0 * i, 1.0]), Vector4(pen_Matrix.W1), loaded[i], Animated.gl));
			}
		}).catch((e) => {
			console.error(e);
		});
		
		Animated.resize();
		window.addEventListener("resize", (event_) => {Animated.resize();});
		
		const hover = document.getElementById("itemHover");
		canvas.addEventListener("mousemove", function(event_){
			let mouseX = event_.offsetX;
			let mouseY = event_.offsetY;
			
			Animated.camera.rotate([(0.5 - mouseY / Animated.canvasSize.y) * Animated.cameraThreshold[1], (0.5 - mouseX / Animated.canvasSize.x) * Animated.cameraThreshold[0], 0.0, 1.0]);
			
			const campos = Vector3(Animated.camera.position);
			const camdir = Vector3(Animated.camera.direction);
			
			let vecRight = camdir.copy().cross(pen_Matrix.Y1).normalize();
			let vecUpwards = vecRight.copy().cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
			
			let cam2mouse = camdir.copy().scale(Animated.camera.Znear).add(vecRight.copy().scale(2 * (Animated.canvasSize.x / Animated.canvasSize.y) * Animated.camera.Znear * Animated.camera.FoVratio * ((mouseX - Animated.canvasSize.x / 2) / Animated.canvasSize.x))).add(vecUpwards.copy().scale(2 * Animated.camera.Znear * Animated.camera.FoVratio * ((Animated.canvasSize.y / 2 - mouseY) / Animated.canvasSize.y)));
			let mouse3d = campos.copy().add(cam2mouse);
			
			let cam2mouseNormalized = cam2mouse.copy().normalize();
			
			for(let i = 0; i < Animated.bodies.length; i++){
				let body = Animated.bodies[i];
				body.selected = false;
				for(let j = 0; j < body.model.vertexCount / 3; j++){
					const d = collision_LineTriangle(
						[campos, cam2mouseNormalized],
						[
							body.model.vertices.subarray(9 * j + 0, 9 * j + 3),
							body.model.vertices.subarray(9 * j + 3, 9 * j + 6),
							body.model.vertices.subarray(9 * j + 6, 9 * j + 9),
						]
					);
					
					if(d != null){
						if(d > 0){
							Animated.bodies[i].selected = true;
							Animated.selected = Animated.bodies[i];
							hover.style.display = "block";
							hover.textContent = Animated.selected.model.name;
							hover.style.left = (mouseX - 20).toString() + "px";
							hover.style.bottom = (Animated.canvasSize.y - mouseY + 20).toString() + "px";
							return;
						}
					}
				}
			}
			Animated.selected = false;
			hover.style.display = "none";
		});
		
		canvas.addEventListener("click", function(event_){
			if(Animated.selected != false){
				const rootID = Animated.selected.model.name.toUpperCase();
				const root = document.getElementById(rootID);
				
				if(rootID == "MANAGER"){
					npc_active = npc_information();
					npc_run();
				}else{
					root.getElementsByClassName("sectionBackground")[0].style.animationName = "";
					root.getElementsByClassName("sectionFrame")[0].style.animationName = "";
					root.getElementsByClassName("sectionContent")[0].style.animationName = "";
					root.getElementsByClassName("sectionCover")[0].style.animationName = "";
					root.getElementsByClassName("buttonFrame")[0].style.animationName = "";
					
					// Stop drawing.
					cancelAnimationFrame(Animated.animationID);
					Animated.animationID = 0;
				}
				
				root.style.display = "block";
				
				Animated.selected.selected = false;
				Animated.selected = false; // Deselect.
				hover.style.display = "none";
			}
		});
		
		// Flip image pixels into the bottom-to-top order that WebGL expects.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		// Draw the scene repeatedly
		function Animated_Play(){
			// Update
			this.deltaTime = this.timeFrameCurrent - this.timeFrameLast;
			this.update();
			
			// Draw
			this.draw();
		}
		animation_initAnimationComponent(Animated, Animated_Play, false, false);
		
		document.getElementById("HOME").getElementsByClassName("buttonEnter")[0].addEventListener("click", function(event_){
			bookClose("HOME", Animated);
			const sectionHome = document.getElementById("HOME");
			sectionHome.getElementsByClassName("buttonFrame")[0].style.display = "flex";
			sectionHome.getElementsByClassName("sectionBackground")[0].getAnimations()[0].addEventListener("finish", (event_) => {
				sectionHome.getElementsByClassName("buttonEnter")[0].style.display = "none";
				npc_active = npc_introduction();
				npc_run();
				document.getElementById("MANAGER").style.display = "block";
			});
		});

		["HOME", "SAUCE", "BUILD", "PROJECTION", "OUTLINE", "RAY-COLLISSION"].forEach((sectionName) => {
			document.getElementById(sectionName).getElementsByClassName("buttonFrame")[0].addEventListener("click", function(event_){
				bookClose(sectionName, Animated);
			});
		});
	}).catch((e) => {
		console.error(e);
	});
}

function bookClose(rootID, animation_)
{
	animation_.animationID = requestAnimationFrame(animation_.animationStart); // Resume drawing.
	const root = document.getElementById(rootID);
	root.getElementsByClassName("sectionBackground")[0].style.animationName = "a_sectionBackground";
	root.getElementsByClassName("sectionFrame")[0].style.animationName = "a_sectionFrame";
	root.getElementsByClassName("sectionContent")[0].style.animationName = "a_sectionContent";
	root.getElementsByClassName("sectionCover")[0].style.animationName = "a_sectionCover";
	root.getElementsByClassName("buttonFrame")[0].style.animationName = "a_buttonFrame";
	root.getElementsByClassName("sectionBackground")[0].getAnimations()[0].addEventListener("finish", (event_) => {
		root.style.display = "none";
	});
}

main();

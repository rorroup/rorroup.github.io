// start here
function manager(){
	const canvas = document.querySelector("#glcanvas"); // TODO: class canvasgl.
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
		
		const shaderProgram = {};
		
		// Initialize a shader program; this is where all the lighting
		// for the vertices and so forth is established.
		shaderProgram.vertexColor = initShaderProgram(gl, vertexColor[0], vertexColor[1]);
		
		if(shaderProgram.vertexColor === null){
			return;
		}
		
		shaderProgram.texture = initShaderProgram(gl, texture[0], texture[1]);
		
		if(shaderProgram.texture === null){
			return;
		}
		
		shaderProgram.silhouette = initShaderProgram(gl, silhouette[0], silhouette[1]);
		
		if(shaderProgram.silhouette === null){
			return;
		}
		
		shaderProgram.outline = initShaderProgram(gl, outline[0], outline[1]);
		
		if(shaderProgram.outline === null){
			return;
		}
		
		// Collect all the info needed to use the shader program.
		// Look up which attribute our shader program is using
		// for aVertexPosition and look up uniform locations.
		const Animated = {
			canvas: canvas,
			gl: gl,
			glProgram: {
				vertexColor: {
					program: shaderProgram.vertexColor,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.vertexColor, "aVertexPosition"),
						aVertexNormal: gl.getAttribLocation(shaderProgram.vertexColor, "aVertexNormal"),
					},
					uniformLocations: {
						uProjectionMatrix: gl.getUniformLocation(shaderProgram.vertexColor, "uProjectionMatrix"),
						uVertexTranslation: gl.getUniformLocation(shaderProgram.vertexColor, "uVertexTranslation"),
						uVertexRotation: gl.getUniformLocation(shaderProgram.vertexColor, "uVertexRotation"),
						uCameraPosition: gl.getUniformLocation(shaderProgram.vertexColor, "uCameraPosition"),
						uCameraRotation: gl.getUniformLocation(shaderProgram.vertexColor, "uCameraRotation"),
						uVertexColor: gl.getUniformLocation(shaderProgram.vertexColor, "uVertexColor"),
						uLightAmbient: gl.getUniformLocation(shaderProgram.vertexColor, "uLightAmbient"),
						uLightDirection: gl.getUniformLocation(shaderProgram.vertexColor, "uLightDirection"),
						uLightColor: gl.getUniformLocation(shaderProgram.vertexColor, "uLightColor"),
						uSelected: gl.getUniformLocation(shaderProgram.vertexColor, "uSelected"),
					},
				},
				texture: {
					program: shaderProgram.texture,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.texture, "aVertexPosition"),
						aVertexNormal: gl.getAttribLocation(shaderProgram.texture, "aVertexNormal"),
						aTextureCoord: gl.getAttribLocation(shaderProgram.texture, "aTextureCoord"),
					},
					uniformLocations: {
						uProjectionMatrix: gl.getUniformLocation(shaderProgram.texture, "uProjectionMatrix"),
						uVertexTranslation: gl.getUniformLocation(shaderProgram.texture, "uVertexTranslation"),
						uVertexRotation: gl.getUniformLocation(shaderProgram.texture, "uVertexRotation"),
						uCameraPosition: gl.getUniformLocation(shaderProgram.texture, "uCameraPosition"),
						uCameraRotation: gl.getUniformLocation(shaderProgram.texture, "uCameraRotation"),
						uSampler: gl.getUniformLocation(shaderProgram.texture, "uSampler"),
						uLightAmbient: gl.getUniformLocation(shaderProgram.texture, "uLightAmbient"),
						uLightDirection: gl.getUniformLocation(shaderProgram.texture, "uLightDirection"),
						uLightColor: gl.getUniformLocation(shaderProgram.texture, "uLightColor"),
						uSelected: gl.getUniformLocation(shaderProgram.texture, "uSelected"),
					},
				},
				silhouette: {
					program: shaderProgram.silhouette,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.silhouette, "aVertexPosition"),
					},
					uniformLocations: {
						uProjectionMatrix: gl.getUniformLocation(shaderProgram.silhouette, "uProjectionMatrix"),
						uVertexTranslation: gl.getUniformLocation(shaderProgram.silhouette, "uVertexTranslation"),
						uVertexRotation: gl.getUniformLocation(shaderProgram.silhouette, "uVertexRotation"),
						uCameraPosition: gl.getUniformLocation(shaderProgram.silhouette, "uCameraPosition"),
						uCameraRotation: gl.getUniformLocation(shaderProgram.silhouette, "uCameraRotation"),
					},
				},
				outline: {
					program: shaderProgram.outline,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.outline, "aVertexPosition"),
						aTextureCoord: gl.getAttribLocation(shaderProgram.outline, "aTextureCoord"),
					},
					uniformLocations: {
						uSampler: gl.getUniformLocation(shaderProgram.outline, "uSampler"),
						uTextureSize: gl.getUniformLocation(shaderProgram.outline, "uTextureSize"),
						uOutlineColor: gl.getUniformLocation(shaderProgram.outline, "uOutlineColor"),
						uOutlineSize: gl.getUniformLocation(shaderProgram.outline, "uOutlineSize"),
					},
					AttributeBuffer: [gl.createBuffer(), gl.createBuffer()],
				},
			},
			canvasSize: Vector2([canvas.offsetWidth, canvas.offsetHeight]),
			screenSize: [parseInt(window.screen.width), parseInt(window.screen.height)],
			relativeSize: [1.0, 1.0],
			Framebuffer_silhouette: createFramebuffer(gl, [parseInt(window.screen.width), parseInt(window.screen.height)]),
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
						gl.useProgram(this.glProgram.vertexColor.program);
						
						draw_vertexColor(this.gl, this.glProgram.vertexColor, camera, this.lightGlobal, bodyCurrent, this.skybox);
					}else{
						// Tell WebGL to use our program when drawing
						gl.useProgram(this.glProgram.texture.program);
						
						draw_texture(this.gl, this.glProgram.texture, camera, this.lightGlobal, bodyCurrent, this.skybox);
					}
				});
				
				
				if(this.selected != false){
					// render to our targetTexture by binding the framebuffer
					gl.bindFramebuffer(gl.FRAMEBUFFER, this.Framebuffer_silhouette.framebuffer);
					
					draw_silhouette(this.gl, this.glProgram.silhouette, camera, this.selected);
					
					// render to the canvas
					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
					
					draw_outline(this.gl, this.glProgram.outline, this.relativeSize, this.screenSize, this.glProgram.outline.AttributeBuffer, this.Framebuffer_silhouette.texture[0]);
				}
			},
		};
		
		// Input constant clip coordinates into outline buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, Animated.glProgram.outline.AttributeBuffer[0]);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0]), gl.STATIC_DRAW);
		
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

function projection()
{
	const canvasgl = document.getElementById("Fig3D").getElementsByClassName("canvasgl")[0];
	// Initialize the GL context
	const gl = canvasgl.getContext("webgl");
	
	// Only continue if WebGL is available and working
	if(gl === null){
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}
	
	Promise.all([
		Promise.all([
			fetch("script/shader/vertexColor0.vs"),
			fetch("script/shader/vertexColor0.fs"),
		]),
		Promise.all([
			fetch("script/shader/texture0.vs"),
			fetch("script/shader/texture0.fs"),
		]),
	]).then((responses) => {
		responses.forEach((response) => {
			response.forEach((shaderFile) => {
				if(!shaderFile.ok){
					throw new Error(`Response status: ${shaderFile.status}`);
				}
			});
		});
		[vertexColor0, texture0] = responses;
		return Promise.all([
			Promise.all([
				vertexColor0[0].text(),
				vertexColor0[1].text(),
			]),
			Promise.all([
				texture0[0].text(),
				texture0[1].text(),
			]),
		]);
	}).then((shaders) => {
		[vertexColor0, texture0] = shaders;
		
		const shaderProgram = {};
		
		shaderProgram.Fig3D_color = initShaderProgram(gl, vertexColor0[0], vertexColor0[1]);
		if(shaderProgram.Fig3D_color === null){
			return;
		}
		
		shaderProgram.Fig3D_texture = initShaderProgram(gl, texture0[0], texture0[1]);
		if(shaderProgram.Fig3D_texture === null){
			return;
		}
		
		// Collect all the info needed to use the shader program.
		// Look up which attribute our shader program is using
		// for aVertexPosition and look up uniform locations.
		const Animated = {
			canvasgl: canvasgl,
			gl: gl,
			glProgram: {
				Fig3D_color: {
					program: shaderProgram.Fig3D_color,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.Fig3D_color, "aVertexPosition"),
					},
					uniformLocations: {
						uProjectionMatrix: gl.getUniformLocation(shaderProgram.Fig3D_color, "uProjectionMatrix"),
						uVertexTranslation: gl.getUniformLocation(shaderProgram.Fig3D_color, "uVertexTranslation"),
						uVertexRotation: gl.getUniformLocation(shaderProgram.Fig3D_color, "uVertexRotation"),
						uCameraPosition: gl.getUniformLocation(shaderProgram.Fig3D_color, "uCameraPosition"),
						uCameraRotation: gl.getUniformLocation(shaderProgram.Fig3D_color, "uCameraRotation"),
						uVertexColor: gl.getUniformLocation(shaderProgram.Fig3D_color, "uVertexColor"),
					},
					AttributeBuffer: gl.createBuffer(),
				},
				Fig3D_texture: {
					program: shaderProgram.Fig3D_texture,
					attribLocations: {
						aVertexPosition: gl.getAttribLocation(shaderProgram.Fig3D_texture, "aVertexPosition"),
						aTextureCoord: gl.getAttribLocation(shaderProgram.Fig3D_texture, "aTextureCoord"),
					},
					uniformLocations: {
						uProjectionMatrix: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uProjectionMatrix"),
						uVertexTranslation: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uVertexTranslation"),
						uVertexRotation: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uVertexRotation"),
						uCameraPosition: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uCameraPosition"),
						uCameraRotation: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uCameraRotation"),
						uSampler: gl.getUniformLocation(shaderProgram.Fig3D_texture, "uSampler"),
					},
					AttributeBuffer: [gl.createBuffer(), gl.createBuffer()],
					texture: [loadTexture(gl, "asset/Znear.png"), loadTexture(gl, "asset/Z.png"), loadTexture(gl, "asset/Zfar.png"), loadTexture(gl, "asset/FoV.png")], // Load texture
					labelAxis: [],
				},
			},
			camera: new Camera(45.0, 0.1, 100.0, 1),
			radius: 12.0,
			mouse: {x: 0, y: 0, b: 0},
			cursor: new Vector3([10, 10, parseInt(document.getElementById("Fig3D").getElementsByTagName("input")[0].value)]),
			point: new Vector3([1.0, 1.0, -5.0]),
			INIT(){
				const camera = new Camera(45.0, 1.0, 10.0, 9 / 16);
				
				this.planeCorner = new Vector3([Math.tan(camera.FoV * 0.5 / 180.0 * Math.PI) / camera.aspectRatio, Math.tan(camera.FoV * 0.5 / 180.0 * Math.PI), 1.0]);
				
				const cornerNear = this.planeCorner.copy().scale(camera.Znear);
				const cornerFar = this.planeCorner.copy().scale(camera.Zfar);
				
				this.FoV = [0.0, -cornerNear.y, 0.0, 0.0, cornerNear.y, 0.0, 0.0, cornerNear.y, -cornerNear.z, 0.0, -cornerNear.y, -cornerNear.z];
				
				this.planes = [
					[-cornerNear.x, -cornerNear.y, -cornerNear.z, -cornerNear.x, cornerNear.y, -cornerNear.z, cornerNear.x, cornerNear.y, -cornerNear.z, cornerNear.x, -cornerNear.y, -cornerNear.z],
					[-cornerFar.x, -cornerFar.y, -cornerFar.z, -cornerFar.x, cornerFar.y, -cornerFar.z, cornerFar.x, cornerFar.y, -cornerFar.z, cornerFar.x, -cornerFar.y, -cornerFar.z],
				];
				
				
				this.pivot = new Vector3([0.0, 0.0, -0.4 * cornerFar.z]);
				
				this.camera.rotate([-20 * Math.PI / 180, 35 * Math.PI / 180, 0.0]);
				this.camera.position.set(this.camera.direction.scale(-this.radius).add(this.pivot));
				this.camera.target(this.pivot);
				
				this.axis = [
					-cornerFar.z * 0.5, 0.0, 0.0, cornerFar.z * 0.5, 0.0, 0.0, // X axis.
					0.0, -cornerFar.z * 0.5, 0.0, 0.0, cornerFar.z * 0.5, 0.0, // Y axis.
					0.0, 0.0, -cornerFar.z, 0.0, 0.0, cornerFar.z * 0.5, // Z axis.
				];
				
				this.pyramid = [
					0.0, 0.0, 0.0, cornerFar.x, cornerFar.y, -cornerFar.z,
					0.0, 0.0, 0.0, -cornerFar.x, cornerFar.y, -cornerFar.z,
					0.0, 0.0, 0.0, cornerFar.x, -cornerFar.y, -cornerFar.z,
					0.0, 0.0, 0.0, -cornerFar.x, -cornerFar.y, -cornerFar.z,
				];
				
				Animated.cursorBG.src = "asset/Z.png";
				
				this.calculatePoint();
				
				
				["-X", "X", "-Y", "Y", "-Z", "Z"].forEach((label) => {
					// https://webglfundamentals.org/webgl/lessons/webgl-text-texture.html
					// create text texture.
					const textCanvas = makeTextCanvas(label);
					const textWidth  = 0.005 * textCanvas.width;
					const textHeight = 0.005 * textCanvas.height;
					const textTex = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, textTex);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
					// make sure we can render it even if it's not a power of 2
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					
					this.glProgram.Fig3D_texture.labelAxis.push({t: textTex, v: [-textWidth, -textHeight, 0, -textWidth, textHeight, 0, textWidth, textHeight, 0, textWidth, -textHeight, 0]});
				});
			},
			calculatePoint(){
				this.point = this.planeCorner.copy().scale(-this.cursor[2] / 10.0);
				this.point.x *= -2.0 * this.cursor[0] / this.canvas2d.offsetWidth + 1.0;
				this.point.y *= 2.0 * this.cursor[1] / this.canvas2d.offsetHeight - 1.0;
			},
			draw_3d(){
				gl.clearColor(0.6, 0.6, 0.6, 1.0); // Background color
				gl.clearDepth(1.0); // Clear everything
				// gl.enable(gl.DEPTH_TEST); // Enable depth testing
				// gl.depthFunc(gl.LEQUAL); // Near things obscure far things
				
				// Clear the canvas before we start drawing on it.
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
				
				gl.disable(gl.DEPTH_TEST);
				gl.depthMask(false);
				
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				
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
				
				gl.useProgram(this.glProgram.Fig3D_color.program);
				
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_color.uniformLocations.uProjectionMatrix,
					false,
					camera.projection
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_color.uniformLocations.uCameraPosition,
					false,
					camera.position
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_color.uniformLocations.uCameraRotation,
					false,
					camera.rotation
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_color.uniformLocations.uVertexTranslation,
					false,
					new Float32Array([
						1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1,
					])
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_color.uniformLocations.uVertexRotation,
					false,
					new Float32Array([
						1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1,
					])
				);
				
				draw_Figure3D_lines(this.gl, this.glProgram.Fig3D_color, camera, this.axis, [0.0, 1.0, 0.0, 1.0], 6); // Axis.
				draw_Figure3D_lines(this.gl, this.glProgram.Fig3D_color, camera, this.pyramid, [0.0, 1.0, 1.0, 0.6], 8); // Pyramid.
				draw_Figure3D_lines(this.gl, this.glProgram.Fig3D_color, camera, [0.0, 0.0, 0.0, ...this.point], [1.0, 1.0, 0.0, 1.0], 2); // Ray.
				draw_Figure3D_lines(this.gl, this.glProgram.Fig3D_color, camera, [0.0, 0.0, 0.0, this.point.x, 0.0, this.point.z, 0.0, 0.0, this.point.z, this.point.x, 0.0, this.point.z], [1.0, 0.0, 0.0, 1.0], 4); // X projection.
				draw_Figure3D_lines(this.gl, this.glProgram.Fig3D_color, camera, [0.0, 0.0, 0.0, 0.0, this.point.y, this.point.z, 0.0, 0.0, this.point.z, 0.0, this.point.y, this.point.z], [0.0, 0.0, 1.0, 1.0], 4); // Y projection.
				{ // Point.
					gl.uniformMatrix4fv(
						this.glProgram.Fig3D_color.uniformLocations.uVertexTranslation,
						false,
						new Float32Array([
							1, 0, 0, 0,
							0, 1, 0, 0,
							0, 0, 1, 0,
							...this.point, 1,
						])
					);
					
					gl.uniform4fv(this.glProgram.Fig3D_color.uniformLocations.uVertexColor, new Float32Array([1.0, 0.0, 1.0, 1.0]));
					
					// aVertexPosition
					gl.bindBuffer(gl.ARRAY_BUFFER, this.glProgram.Fig3D_color.AttributeBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(makeCube(0.1, 0.1, 0.1)[0]), gl.STATIC_DRAW);
					gl.vertexAttribPointer(this.glProgram.Fig3D_color.attribLocations.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
					gl.enableVertexAttribArray(this.glProgram.Fig3D_color.attribLocations.aVertexPosition);
					
					gl.drawArrays(gl.TRIANGLES, 0, 36);
				}
				
				
				gl.useProgram(this.glProgram.Fig3D_texture.program);
				
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_texture.uniformLocations.uProjectionMatrix,
					false,
					camera.projection
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_texture.uniformLocations.uCameraPosition,
					false,
					camera.position
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_texture.uniformLocations.uCameraRotation,
					false,
					camera.rotation
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_texture.uniformLocations.uVertexTranslation,
					false,
					new Float32Array([
						1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1,
					])
				);
				gl.uniformMatrix4fv(
					this.glProgram.Fig3D_texture.uniformLocations.uVertexRotation,
					false,
					new Float32Array([
						1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1,
					])
				);
				
				const cornerZ = this.planeCorner.copy().scale(-this.point.z);
				const squareTexCoord = [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0];
				
				[
					{ // Znear.
						v: this.planes[0],
						t: squareTexCoord,
						i: this.glProgram.Fig3D_texture.texture[0],
					},
					{ // Zfar.
						v: this.planes[1],
						t: squareTexCoord,
						i: this.glProgram.Fig3D_texture.texture[2],
					},
					{ // FoV.
						v: this.FoV,
						t: squareTexCoord,
						i: this.glProgram.Fig3D_texture.texture[3],
					},
					{ // Z.
						v: [-cornerZ.x, -cornerZ.y, -cornerZ.z, -cornerZ.x, cornerZ.y, -cornerZ.z, cornerZ.x, cornerZ.y, -cornerZ.z, cornerZ.x, -cornerZ.y, -cornerZ.z],
						t: squareTexCoord,
						i: this.glProgram.Fig3D_texture.texture[1],
					},
				].forEach((plane) => {
					draw_Figure3D_planes(gl, this.glProgram.Fig3D_texture, plane);
				});
				
				for(let i = 0; i < this.glProgram.Fig3D_texture.labelAxis.length; i++){
					const position = this.axis.slice(0 + 3 * i, 3 + 3 * i);
					
					gl.uniformMatrix4fv(
						this.glProgram.Fig3D_texture.uniformLocations.uVertexTranslation,
						false,
						new Float32Array([
							1, 0, 0, 0,
							0, 1, 0, 0,
							0, 0, 1, 0,
							...position, 1
						])
					);
					gl.uniformMatrix4fv(
						this.glProgram.Fig3D_texture.uniformLocations.uVertexRotation,
						false,
						new Float32Array([
							Math.cos(this.camera.rotation.y), 0, -Math.sin(this.camera.rotation.y), 0,
							Math.sin(this.camera.rotation.x) * Math.sin(this.camera.rotation.y), Math.cos(this.camera.rotation.x), Math.sin(this.camera.rotation.x) * Math.cos(this.camera.rotation.y), 0,
							Math.cos(this.camera.rotation.x) * Math.sin(this.camera.rotation.y), -Math.sin(this.camera.rotation.x), Math.cos(this.camera.rotation.x) * Math.cos(this.camera.rotation.y), 0,
							0, 0, 0, 1,
						])
					);
					
					// Tell WebGL we want to affect texture unit 0
					gl.activeTexture(gl.TEXTURE0);

					// Bind the texture to texture unit 0
					gl.bindTexture(gl.TEXTURE_2D, this.glProgram.Fig3D_texture.labelAxis[i].t);

					// Tell the shader we bound the texture to texture unit 0
					gl.uniform1i(this.glProgram.Fig3D_texture.uniformLocations.uSampler, 0);
					
					// aVertexPosition
					gl.bindBuffer(gl.ARRAY_BUFFER, this.glProgram.Fig3D_texture.AttributeBuffer[0]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.glProgram.Fig3D_texture.labelAxis[i].v), gl.STATIC_DRAW);
					gl.vertexAttribPointer(this.glProgram.Fig3D_texture.attribLocations.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
					gl.enableVertexAttribArray(this.glProgram.Fig3D_texture.attribLocations.aVertexPosition);
					
					// aTextureCoord
					gl.bindBuffer(gl.ARRAY_BUFFER, this.glProgram.Fig3D_texture.AttributeBuffer[1]);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squareTexCoord), gl.STATIC_DRAW);
					gl.vertexAttribPointer(this.glProgram.Fig3D_texture.attribLocations.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
					gl.enableVertexAttribArray(this.glProgram.Fig3D_texture.attribLocations.aTextureCoord);
					
					gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
				}
			},
			canvas2d: document.getElementById("Fig3D").getElementsByClassName("canvas2d")[0],
			ctx2d: document.getElementById("Fig3D").getElementsByClassName("canvas2d")[0].getContext("2d"),
			cursorBG: new Image(),
			draw_2d(){
				this.ctx2d.drawImage(this.cursorBG, 0, 0, this.canvas2d.offsetWidth, this.canvas2d.offsetHeight);
				canvas2d_drawPoint(this.ctx2d, this.cursor, "#FF00FF", 3);
			},
			draw(){
				this.draw_2d();
				this.draw_3d();
			},
		};
		
		// Flip image pixels into the bottom-to-top order that WebGL expects.
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		Animated.INIT();
		
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event#examples
		Animated.canvasgl.onwheel = (event_) => {
			event_.preventDefault();
			
			Animated.radius = Math.min(15.0, Math.max(2.0, Animated.radius + event_.deltaY * 0.005));
			Animated.camera.position.set(Animated.camera.direction.scale(-Animated.radius).add(Animated.pivot));
			Animated.camera.target(Animated.pivot);
		};
		
		Animated.canvasgl.addEventListener("mouseleave", function(event_){
			Animated.mouse.b = 0;
		});
		
		Animated.canvasgl.addEventListener("mousemove", function(event_){
			if(event_.buttons == 1 && Animated.mouse.b == 1){
				Animated.camera.rotate(Animated.camera.rotation.substract([0.007 * (event_.offsetY - Animated.mouse.y), 0.007 * (event_.offsetX - Animated.mouse.x), 0, 0]));
				Animated.camera.position.set(Animated.camera.direction.scale(-Animated.radius).add(Animated.pivot));
				Animated.camera.target(Animated.pivot);
			}
			Animated.mouse = {
				x: event_.offsetX,
				y: event_.offsetY,
				b: event_.buttons,
			};
		});
		
		Animated.canvasgl.addEventListener("mousedown", function(event_){
			Animated.mouse = {
				x: event_.offsetX,
				y: event_.offsetY,
				b: event_.buttons,
			};
		});
		
		Animated.canvasgl.addEventListener("mouseup", function(event_){
			Animated.mouse = {
				x: event_.offsetX,
				y: event_.offsetY,
				b: event_.buttons,
			};
		});
		
		document.getElementById("Fig3D").getElementsByTagName("input")[0].oninput = function(){
			Animated.cursor[2] = parseInt(this.value);
			Animated.calculatePoint();
		};
		
		Animated.canvas2d.addEventListener("mousedown", function(event_){
			if(event_.buttons == 1){
				Animated.cursor[0] = event_.offsetX;
				Animated.cursor[1] = event_.offsetY;
				Animated.calculatePoint();
			}
		});
		
		Animated.canvas2d.addEventListener("mousemove", function(event_){
			if(event_.buttons == 1){
				Animated.cursor[0] = event_.offsetX;
				Animated.cursor[1] = event_.offsetY;
				Animated.calculatePoint();
			}
		});
		
		const pointControl = document.getElementById("Fig3D").getElementsByClassName("point")[0].getElementsByClassName("controls")[0];
		document.getElementById("Fig3D").getElementsByClassName("point")[0].getElementsByClassName("display")[0].addEventListener("click", function(event_){
			pointControl.style.display = (pointControl.style.display == "none") ? "block" : "none";
		});
		
		
		{ // TODO: REMOVE.
			canvasgl.width = canvasgl.offsetWidth;
			canvasgl.height = canvasgl.offsetHeight;
			gl.viewport(0, 0, canvasgl.offsetWidth, canvasgl.offsetHeight);
			Animated.camera.aspectRatio = canvasgl.offsetHeight / canvasgl.offsetWidth;
			Animated.camera.project();
			
			Animated.canvas2d.width = Animated.canvas2d.offsetWidth;
			Animated.canvas2d.height = Animated.canvas2d.offsetHeight;
		}
		
		
		// Draw the scene repeatedly
		function Animated_Play(){
			// Update
			this.deltaTime = this.timeFrameCurrent - this.timeFrameLast;
			// this.update();
			
			// Draw
			this.draw();
		}
		animation_initAnimationComponent(Animated, Animated_Play, false, true); // TODO: DO NOT INITIATE ANIMATION.
		
		// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
		new MutationObserver((mutationList, observer) => {
			for(const mutation of mutationList){
				if(mutation.type == "attributes" && mutation.attributeName == "style"){
					if(mutation.target.style.display == "none"){
						if(Animated.animationID != 0){
							// Stop animation.
							cancelAnimationFrame(Animated.animationID);
							Animated.animationID = 0;
						}
					}else{
						// Adjust resolution.
						canvasgl.width = canvasgl.offsetWidth;
						canvasgl.height = canvasgl.offsetHeight;
						gl.viewport(0, 0, canvasgl.offsetWidth, canvasgl.offsetHeight);
						
						Animated.camera.aspectRatio = canvasgl.offsetHeight / canvasgl.offsetWidth;
						Animated.camera.project();
						
						Animated.canvas2d.width = Animated.canvas2d.offsetWidth;
						Animated.canvas2d.height = Animated.canvas2d.offsetHeight;
						
						if(Animated.animationID == 0){
							// Resume animation.
							Animated.animationID = requestAnimationFrame(Animated.animationStart);
						}
					}
				}
			}
		}).observe(document.getElementById("PROJECTION"), {attributes: true});
		
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


const textCtx = document.createElement("canvas").getContext("2d");

// Puts text in canvas.
function makeTextCanvas(text_, color = "#000000", font = "30px Arial"){
	textCtx.font = font;
	textCtx.canvas.width = Math.ceil(textCtx.measureText(text_).width);
	textCtx.canvas.height = parseInt(font);
	textCtx.font = font; // Resizing resets the font.
	textCtx.textAlign = "left";
	textCtx.textBaseline = "top";
	textCtx.fillStyle = color;
	textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
	textCtx.fillText(text_, 0, 0);
	return textCtx.canvas;
}

function main()
{
	manager();
	projection();
}

main();

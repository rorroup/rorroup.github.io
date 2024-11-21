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

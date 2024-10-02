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
			},
			canvasSize: Vector2([canvas.offsetWidth, canvas.offsetHeight]),
			camera: new Camera(45.0, 0.1, 100.0, canvas.offsetHeight / canvas.offsetWidth, [0.2, -0.4, -1.2, 1.0], [0.0, -Math.PI * 90 / 180, 0.0, 1.0]),
			cameraThreshold: [],
			lightGlobal: {
				diffuse: Vector3([0.3, 0.3, 0.3]),
				directional: {
					direction: Vector3([-1.0, -10.0, -2.0]).normalize(),
					color: Vector3([1.0, 1.0, 1.0]),
				},
			},
			scenery: [],
			bodies: [],
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
				this.scenery.forEach((body) => {body.update(this.deltaTime);});
				this.bodies.forEach((body) => {body.update(this.deltaTime);});
			},
			draw(){
				drawScene(this.gl, this, this.camera, this.lightGlobal, this.scenery.concat(this.bodies));
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
			
			if(intersections.length > 0){
				intersections.sort((a, b) => {return a[1] - b[1];});
				Animated.bodies[intersections[0][0]].selected = true;
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
		animation_initAnimationComponent(Animated, Animated_Play);
		
	}).catch((e) => {
		console.error(e);
	});
}


main();

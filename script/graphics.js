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
	
	let canvasSize = F32Vector(2, [canvas.offsetWidth, canvas.offsetHeight]);
	
	Promise.all([
		fetch("script/shader/vertexColor.vs"),
		fetch("script/shader/vertexColor.fs"),
	]).then((responses) => {
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
	const programInfo = {
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
	};
	
	
	let camera = new Camera(45.0, 0.1, 100.0, canvasSize[1] / canvasSize[0], [0.2, -0.4, -1.2, 1.0], [0.0, -Math.PI * 90 / 180, 0.0, 1.0]);
	
	let camRangeH = Math.PI * 25 / 180;
	let camrangeV = Math.PI * 25 / 180;
	
	let LightGlobal = {
		diffuse: F32Vector(3, [0.3, 0.3, 0.3]),
		directional: {
			direction: F32Vector(3, [-1.0, -10.0, -2.0]).normalize(),
			color: F32Vector(3, [1.0, 1.0, 1.0]),
		},
	};
	
	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	let bodies = [];
	
	fetch("asset/scene3.obj").then((res) =>
		res.text()
	).then((text) =>
		pen_obj.obj_load(text)
	).then((loaded) => {
		for(let i = 0; i < loaded.length; i++){
			bodies.push(new Body(new Float32Array([0.0, 0.0, 0.0, 1.0]), new Float32Array([0.0, 0.0, 0.0, 1.0]), loaded[i], gl));
		}
	}).catch((e) => {
		console.error(e);
	});
	
	[camRangeH, camrangeV] = update_canvasResize(canvas, camera, canvasSize);
	window.addEventListener("resize", function(event_){
		[camRangeH, camrangeV] = update_canvasResize(canvas, camera, canvasSize);
	});
	
	canvas.addEventListener("mousemove", function(event_){
		let mouseX = event_.offsetX;
		let mouseY = event_.offsetY;
		
		camera.rotate([(mouseY / canvasSize[1] - 0.5) * camrangeV, -Math.PI * 90 / 180 + (mouseX / canvasSize[0] - 0.5) * camRangeH, 0.0, 1.0]);
		
		const campos = new F32Vector(3, [-camera.position[0], -camera.position[1], -camera.position[2]]);
		const camdir = new F32Vector(3, [-camera.direction[0], -camera.direction[1], camera.direction[2]]);
		
		let vecRight = camdir.copy().cross(pen_F32Matrix.Y1).normalize();
		let vecUpwards = vecRight.copy().cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
		
		let cam2mouse = camdir.copy().scale(camera.Znear).add(vecRight.copy().scale(2 * (canvasSize[0] / canvasSize[1]) * camera.Znear * camera.FoVratio * ((mouseX - canvasSize[0] / 2) / canvasSize[0]))).add(vecUpwards.copy().scale(2 * camera.Znear * camera.FoVratio * ((canvasSize[1] / 2 - mouseY) / canvasSize[1])));
		let mouse3d = campos.copy().add(cam2mouse);
		
		let cam2mouseNormalized = cam2mouse.copy().normalize();
		
		let intersections = [];
		
		for(let i = 0; i < bodies.length; i++){
			let body = bodies[i];
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
			bodies[intersections[0][0]].selected = true;
		}
	});
	
	// Flip image pixels into the bottom-to-top order that WebGL expects.
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	let then = 0;
	// Draw the scene repeatedly
	function render(now){
		let deltaTime = now - then;
		then = now;
		
		drawScene(gl, programInfo, camera, LightGlobal, bodies, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
	
	}).catch((e) => {
		console.error(e);
	});
}


main();


function update_canvasResize(glcanvas, camera, canvasSize)
{
	const gl = glcanvas.getContext("webgl");
	
	canvasSize[0] = glcanvas.offsetWidth;
	canvasSize[1] = glcanvas.offsetHeight;
	
	// Update canvas size.
	glcanvas.width = canvasSize[0];
	glcanvas.height = canvasSize[1];
	
	// Apply viewport resolution.
	gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
	
	// Adjust horizontal and vertical camera direction ranges.
	camRangeH = Math.PI * (37 + 32 * ((canvasSize[1] / canvasSize[0]) - (9 / 16))) / 180;
	camrangeV = Math.PI * (35 - 22 * ((canvasSize[1] / canvasSize[0]) - (9 / 16))) / 180;
	
	// Move camera position.
	camera.position[0] = 0.0 - 0.8 * ((canvasSize[1] / canvasSize[0]) - (9 / 16));
	
	// Update projection matrix.
	camera.aspectRatio = canvasSize[1] / canvasSize[0];
	camera.project();
	
	return [camRangeH, camrangeV];
}

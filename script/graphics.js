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
	
	
	let camera = new Camera(45.0, 0.1, 100.0, canvas.offsetHeight / canvas.offsetWidth, [0.2, -0.4, -1.2, 1.0], [0.0, -Math.PI * 90 / 180, 0.0, 1.0]);
	
	let camRangeH = Math.PI * 25 / 180;
	let camrangeV = Math.PI * 25 / 180;
	
	let LightAmbient = new Float32Array([0.3, 0.3, 0.3]);
	let LightDirection = new Float32Array([-0.09759000729485333, -0.9759000729485332, -0.19518001458970666]);
	let LightColor = new Float32Array([1.0, 1.0, 1.0]);
	
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
	
	[camRangeH, camrangeV] = update_canvasResize(camera);
	window.addEventListener("resize", function(event_){
		[camRangeH, camrangeV] = update_canvasResize(camera);
	});
	
	document.getElementById("glcanvas").addEventListener("mousemove", function(event_){
		let mouseX = event_.offsetX;
		let mouseY = event_.offsetY;
		
		const canvasWidth = event_.target.offsetWidth;
		const canvasHeight = event_.target.offsetHeight;
		
		const mouseH = mouseX / canvasWidth - 0.5;
		const mouseV = mouseY / canvasHeight - 0.5;
		
		camera.rotate([mouseV * camrangeV, -Math.PI * 90 / 180 + mouseH * camRangeH, 0.0, 1.0]);
	});
	
	document.getElementById("glcanvas").addEventListener("mousemove", function(event_){
		let mouseX = event_.offsetX;
		let mouseY = event_.offsetY;
		
		const canvasWidth = event_.target.offsetWidth;
		const canvasHeight = event_.target.offsetHeight;
		
		const campos = new F32Vector(3, [-camera.position[0], -camera.position[1], -camera.position[2]]);
		const camdir = new F32Vector(3, [-camera.direction[0], -camera.direction[1], camera.direction[2]]);
		
		let vecRight = camdir.copy().cross(pen_F32Matrix.Y1).normalize();
		let vecUpwards = vecRight.copy().cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
		
		let cam2mouse = camdir.copy().scale(camera.Znear).add(vecRight.copy().scale(2 * (canvasWidth / canvasHeight) * camera.Znear * camera.FoVratio * ((mouseX - canvasWidth / 2) / canvasWidth))).add(vecUpwards.copy().scale(2 * camera.Znear * camera.FoVratio * ((canvasHeight / 2 - mouseY) / canvasHeight)));
		let mouse3d = campos.copy().add(cam2mouse);
		
		let cam2mouseNormalized = cam2mouse.copy().normalize();
		
		let intersections = [];
		
		for(let i = 0; i < bodies.length; i++){
			let body = bodies[i];
			body.selected = false;
			for(let j = 0; j < body.model.vertexCount / 3; j++){
				let v1 = new F32Vector(3, [...body.model.vertices.slice(9 * j + 0, 9 * j + 3)]);
				let v2 = new F32Vector(3, [...body.model.vertices.slice(9 * j + 3, 9 * j + 6)]);
				let v3 = new F32Vector(3, [...body.model.vertices.slice(9 * j + 6, 9 * j + 9)]);
				
				let vec1 = v1.copy().substract(v2);
				let vec2 = v2.copy().substract(v3);
				let vec3 = v3.copy().substract(v1);
				
				let n1 = v1.copy().substract(campos).cross(vec1);
				let n2 = v2.copy().substract(campos).cross(vec2);
				let n3 = v3.copy().substract(campos).cross(vec3);
				
				if(cam2mouse.dot(n1) > 0 && cam2mouse.dot(n2) > 0 && cam2mouse.dot(n3) > 0 && cam2mouse.dot(vec1.copy().cross(vec2)) < 0){
					// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
					let n = vec1.copy().cross(vec2);
					let parallel = cam2mouse.dot(n);
					if(parallel != 0){
						let d = v1.copy().substract(campos).dot(n) / parallel;
						// let intersection = campos.copy().add(cam2mouse.copy().scale(d));
						intersections.push([i, d]);
					}
					break;
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
		
		drawScene(gl, programInfo, camera, {Ambient: LightAmbient, Direction: LightDirection, Color: LightColor}, bodies, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
	
	}).catch((e) => {
		console.error(e);
	});
}


main();


function update_canvasResize(camera)
{
	const glcanvas = document.getElementById("glcanvas");
	const gl = glcanvas.getContext("webgl");
	
	const canvasWidth = glcanvas.offsetWidth;
	const canvasHeight = glcanvas.offsetHeight;
	
	// Update canvas size.
	glcanvas.width = canvasWidth;
	glcanvas.height = canvasHeight;
	
	// Apply viewport resolution.
	gl.viewport(0, 0, canvasWidth, canvasHeight);
	
	// Adjust horizontal and vertical camera direction ranges.
	camRangeH = Math.PI * (37 + 32 * ((canvasHeight / canvasWidth) - (9 / 16))) / 180;
	camrangeV = Math.PI * (35 - 22 * ((canvasHeight / canvasWidth) - (9 / 16))) / 180;
	
	// Move camera position.
	camera.position[0] = 0.0 - 0.8 * ((canvasHeight / canvasWidth) - (9 / 16));
	
	// Update projection matrix.
	camera.aspectRatio = canvasHeight / canvasWidth;
	camera.project();
	
	return [camRangeH, camrangeV];
}

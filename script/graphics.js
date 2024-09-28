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
	
	let fNear = 0.1;
	let fFar = 100.0;
	let fFov = 45.0;
	let fFovRad = 1.0 / Math.tan(fFov * 0.5 / 180.0 * Math.PI);
	let myProjectionMatrix = new Matrix(4, 4);
	
	let cameraPos = new Float32Array([0.2, -0.4, -1.2, 1.0]);
	let cameraRot = new Float32Array([0.0, -Math.PI * 90 / 180, 0.0, 1.0]);
	let cameraDir = new Float32Array([0.0, 0.0, -1.0, 1.0]);
	
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
	
	[cameraPos, camRangeH, camrangeV, myProjectionMatrix] = update_canvasResize(cameraPos, myProjectionMatrix, fNear, fFar, fFovRad);
	window.addEventListener("resize", function(event_){
		[cameraPos, camRangeH, camrangeV, myProjectionMatrix] = update_canvasResize(cameraPos, myProjectionMatrix, fNear, fFar, fFovRad);
	});
	
	cameraDir = update_cameraDir(cameraDir, cameraRot);
	document.getElementById("glcanvas").addEventListener("mousemove", function(event_){
		let mouseX = event_.offsetX;
		let mouseY = event_.offsetY;
		
		const canvasWidth = event_.target.offsetWidth;
		const canvasHeight = event_.target.offsetHeight;
		
		const mouseH = mouseX / canvasWidth - 0.5;
		const mouseV = mouseY / canvasHeight - 0.5;
		
		cameraRot[0] = mouseV * camrangeV;
		cameraRot[1] = -Math.PI * 90 / 180 + mouseH * camRangeH;
		
		cameraDir = update_cameraDir(cameraDir, cameraRot);
	});
	
	document.getElementById("glcanvas").addEventListener("mousemove", function(event_){
		let mouseX = event_.offsetX;
		let mouseY = event_.offsetY;
		
		const canvasWidth = event_.target.offsetWidth;
		const canvasHeight = event_.target.offsetHeight;
		
		const campos = new Vector3(-cameraPos[0], -cameraPos[1], -cameraPos[2]);
		const camdir = new Vector3(-cameraDir[0], -cameraDir[1], cameraDir[2]);
		
		let vecRight = camdir.cross(new Vector3(0.0, 1.0, 0.0));
		vecRight = vecRight.scale(1 / vecRight.magnitude()); // Normalize.
		let vecUpwards = vecRight.cross(camdir); // Normalized already since it is the cross product of 2 normalized orthoginal vectors.
		
		let cam2mouse = camdir.scale(fNear).add(vecRight.scale(2 * (canvasWidth / canvasHeight) * fNear / fFovRad * ((mouseX - canvasWidth / 2) / canvasWidth))).add(vecUpwards.scale(2 * fNear / fFovRad * ((canvasHeight / 2 - mouseY) / canvasHeight)));
		let mouse3d = campos.add(cam2mouse);
		
		let cam2mouseNormalized = cam2mouse.scale(1 / cam2mouse.magnitude());
		
		let intersections = [];
		
		for(let i = 0; i < bodies.length; i++){
			let body = bodies[i];
			body.selected = false;
			for(let j = 0; j < body.model.vertexCount / 3; j++){
				let v1 = new Vector3(...body.model.vertices.slice(9 * j + 0, 9 * j + 3));
				let v2 = new Vector3(...body.model.vertices.slice(9 * j + 3, 9 * j + 6));
				let v3 = new Vector3(...body.model.vertices.slice(9 * j + 6, 9 * j + 9));
				
				let vec1 = v1.add(v2.scale(-1.0));
				let vec2 = v2.add(v3.scale(-1.0));
				let vec3 = v3.add(v1.scale(-1.0));
				
				let n1 = v1.add(campos.scale(-1.0)).cross(vec1);
				let n2 = v2.add(campos.scale(-1.0)).cross(vec2);
				let n3 = v3.add(campos.scale(-1.0)).cross(vec3);
				
				if(cam2mouse.dot(n1) > 0 && cam2mouse.dot(n2) > 0 && cam2mouse.dot(n3) > 0 && cam2mouse.dot(vec1.cross(vec2)) < 0){
					// https://en.wikipedia.org/wiki/Line%E2%80%93plane_intersection
					let n = vec1.cross(vec2);
					let parallel = cam2mouse.dot(n);
					if(parallel != 0){
						let d = v1.add(campos.scale(-1.0)).dot(n) / parallel;
						// let intersection = campos.add(cam2mouse.scale(d));
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
		
		drawScene(gl, programInfo, {projection: myProjectionMatrix, position: cameraPos, rotation: cameraRot}, {Ambient: LightAmbient, Direction: LightDirection, Color: LightColor}, bodies, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
	
	}).catch((e) => {
		console.error(e);
	});
}


main();


function update_cameraDir(cameraDir, cameraRot){
	let r = 1;
	
	let x = -r * Math.sin(cameraRot[1]) * Math.cos(cameraRot[0]);
	let z = -r * Math.cos(cameraRot[1]) * Math.cos(cameraRot[0]);
	let y = r * Math.sin(cameraRot[0]);
	
	cameraDir = [x, y, z, 1.0];
	
	// let phi = Math.asin(y / r);
	// let theta = Math.atan2(-x, -z);
	
	return cameraDir;
}

function update_canvasResize(cameraPos, mProjection, fNear, fFar, fFovRad)
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
	
	// Move camera position.
	cameraPos[0] = 0.0 - 0.8 * ((canvasHeight / canvasWidth) - (9 / 16));
	
	// Adjust horizontal and vertical camera direction ranges.
	camRangeH = Math.PI * (37 + 32 * ((canvasHeight / canvasWidth) - (9 / 16))) / 180;
	camrangeV = Math.PI * (35 - 22 * ((canvasHeight / canvasWidth) - (9 / 16))) / 180;
	
	// Update projection matrix.
	build_ProjectionMatrix(mProjection, fNear, fFar, fFovRad, canvasHeight / canvasWidth);
	
	return [cameraPos, camRangeH, camrangeV, mProjection];
}

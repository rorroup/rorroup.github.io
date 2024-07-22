

class Matrix{
	constructor(rows, columns){
		this.row = rows;
		this.col = columns;
		this.el = Array(rows);
		for(let i = 0; i < rows; i++){
			this.el[i] = Array(columns);
			this.el[i].fill(0);
		}
	}
}

let myProjectionMatrix = new Matrix(4, 4);


const webglcanvas = document.querySelector("#glcanvas");
const canvasWidth = webglcanvas.offsetWidth;
const canvasHeight = webglcanvas.offsetHeight;


let fNear = 0.1;
let fFar = 100.0;
let fFov = 45.0;
let fAspectRatio = canvasHeight / canvasWidth;
let fFovRad = 1.0 / Math.tan(fFov * 0.5 / 180.0 * Math.PI);



myProjectionMatrix.el[0][0] = fAspectRatio * fFovRad;
myProjectionMatrix.el[1][1] = fFovRad;
myProjectionMatrix.el[2][2] = fFar / (fFar - fNear)            * -1 ;  //// ????????????
myProjectionMatrix.el[3][2] = (-fFar * fNear) / (fFar - fNear)  * 2;  /// ???????
myProjectionMatrix.el[2][3] = 1.0                              * -1;  /// ??????????????



function makeCube(x, y, z){
	x = x / 2;
	y = y / 2;
	z = z / 2;
	const positions = [
		// Front face
		// 0	1	2	3
		-x, -y, z, x, -y, z, x, y, z, -x, -y, z, x, y, z, -x, y, z,

		// Back face
		// 4	5	6	7
		-x, -y, -z, -x, y, -z, x, y, -z, -x, -y, -z, x, y, -z, x, -y, -z,

		// Top face
		// 8	9	10	11
		-x, y, -z, -x, y, z, x, y, z, -x, y, -z, x, y, z, x, y, -z,

		// Bottom face
		// 12	13	14	15
		-x, -y, -z, x, -y, -z, x, -y, z, -x, -y, -z, x, -y, z, -x, -y, z,

		// Right face
		// 16	17	18	19
		x, -y, -z, x, y, -z, x, y, z, x, -y, -z, x, y, z, x, -y, z,

		// Left face
		// 20	21	22	23
		-x, -y, -z,	// 20
		-x, -y, z,	// 21
		-x, y, z,	// 22
		-x, -y, -z,
		-x, y, z,
		-x, y, -z,	// 23
	];
	
	return positions;
}


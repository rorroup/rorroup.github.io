

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




let fNear = 0.1;
let fFar = 100.0;
let fFov = 45.0;
let fAspectRatio = 150.0 / 300.0;
let fFovRad = 1.0 / Math.tan(fFov * 0.5 / 180.0 * Math.PI);



myProjectionMatrix.el[0][0] = fAspectRatio * fFovRad;
myProjectionMatrix.el[1][1] = fFovRad;
myProjectionMatrix.el[2][2] = fFar / (fFar - fNear)            * -1 ;  //// ????????????
myProjectionMatrix.el[3][2] = (-fFar * fNear) / (fFar - fNear)  * 2;  /// ???????
myProjectionMatrix.el[2][3] = 1.0                              * -1;  /// ??????????????



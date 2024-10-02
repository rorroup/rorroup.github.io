
class F32Matrix
{
	/*
		Simple and flexible fixed size Float32 Matrix class in column-main-order.
		Can hold up to 'pen_F32Matrix.MAX_ELEMENTS' elements.
		All matrix operations are done in-place as they modify the caller (left-hand) operand.
		Error checking has been omitted to enhance performance.
	*/
	
	constructor(size, data = false)
	{
		let rows, columns;
		if(isNaN(size)){
			rows = size[0];
			columns = size[1];
		}else{
			rows = columns = Number(size);
		}
		this.data = Array(rows * columns);
		this.data.fill(0.0);
		if(data != false) this.data.splice(0, data.length, ...(data.slice(0, this.data.length)));
		this.rows = rows;
		this.columns = columns;
	}
	
	copy(){
		return new F32Matrix([this.rows, this.columns], this.data);
	}
	
	// General linear algebra operations.
	
	scale(scalar){
		for(let i = 0; i < this.data.length; i++){
			this.data[i] *= scalar;
		}
		return this;
	}
	
	add(other){
		for(let i = 0; i < this.data.length; i++){
			this.data[i] += other.data[i];
		}
		return this;
	}
	
	substract(other){
		for(let i = 0; i < this.data.length; i++){
			this.data[i] -= other.data[i];
		}
		return this;
	}
	
	multiply(other){
		let matrix = [];
		for(let i = 0; i < other.columns; i++){
			for(let j = 0; j < this.rows; j++){
				let result = 0.0;
				for(let k = 0; k < this.columns; k++){
					result += this.data[k * this.columns + j] * other.data[i * other.rows + k];
				}
				matrix.push(result);
			}
		}
		this.columns = other.columns;
		this.data = matrix;
		return this;
	}
	
	// Vector (1-column matrix) operations.
	
	get magnitude(){
		return Math.sqrt(this.dot(this));
	}
	
	normalize(){
		this.scale(1.0 / this.magnitude);
		return this;
	}
	
	dot(other){
		let result = 0.0;
		for(let i = 0; i < this.data.length; i++){
			result += this.data[i] * other.data[i];
		}
		return result;
	}
	
	cross(other){
		this.data = [
			this.data[1] * other.data[2] - other.data[1] * this.data[2],
			this.data[2] * other.data[0] - other.data[2] * this.data[0],
			this.data[0] * other.data[1] - other.data[0] * this.data[1],
			1.0
		].slice(0, this.data.length);
		return this;
	}
	
	// 4D Vector component access.
	
	get x(){return this.data[0];}
	set x(val){this.data[0] = val;}
	get y(){return this.data[1];}
	set y(val){this.data[1] = val;}
	get z(){return this.data[2];}
	set z(val){this.data[2] = val;}
	get w(){return this.data[3];}
	set w(val){this.data[3] = val;}
}

function F32Vector(size, data = false)
{
	return new F32Matrix([size, 1], data);
}

const pen_F32Matrix = {
	X1: F32Vector(4, [1.0, 0.0, 0.0, 1.0]),
	Y1: F32Vector(4, [0.0, 1.0, 0.0, 1.0]),
	Z1: F32Vector(4, [0.0, 0.0, 1.0, 1.0]),
	W1: F32Vector(4, [0.0, 0.0, 0.0, 1.0]),
	ZERO: F32Vector(4, [0.0, 0.0, 0.0, 0.0]),
};

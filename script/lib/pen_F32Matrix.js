
class F32Matrix extends Array
{
	/*
		Simple and flexible Matrix class in column-main-order.
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
		super(rows * columns);
		this.fill(0.0);
		this.rows = rows;
		this.columns = columns;
		if(data != false) this.set(data);
	}
	
	set(data){
		this.splice(0, data.length, ...data.slice(0, this.rows * this.columns));
	}
	
	copy(){
		return new F32Matrix([this.rows, this.columns], this);
	}
	
	// General linear algebra operations.
	
	scale(scalar){
		for(let i = 0; i < this.length; i++){
			this[i] *= scalar;
		}
		return this;
	}
	
	add(other){
		for(let i = 0; i < this.length; i++){
			this[i] += other[i];
		}
		return this;
	}
	
	substract(other){
		for(let i = 0; i < this.length; i++){
			this[i] -= other[i];
		}
		return this;
	}
	
	multiply(other){
		let matrix = [];
		for(let i = 0; i < other.columns; i++){
			for(let j = 0; j < this.rows; j++){
				let result = 0.0;
				for(let k = 0; k < this.columns; k++){
					result += this[k * this.columns + j] * other[i * other.rows + k];
				}
				matrix.push(result);
			}
		}
		this.columns = other.columns;
		this.set(matrix);
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
		for(let i = 0; i < this.length; i++){
			result += this[i] * other[i];
		}
		return result;
	}
	
	cross(other){
		this.set([
			this[1] * other[2] - other[1] * this[2],
			this[2] * other[0] - other[2] * this[0],
			this[0] * other[1] - other[0] * this[1],
		]);
		return this;
	}
	
	// 4D Vector component access.
	
	get x(){return this[0];}
	set x(val){this[0] = val;}
	get y(){return this[1];}
	set y(val){this[1] = val;}
	get z(){return this[2];}
	set z(val){this[2] = val;}
	get w(){return this[3];}
	set w(val){this[3] = val;}
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

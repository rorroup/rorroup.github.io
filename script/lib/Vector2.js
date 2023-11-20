
class Vector2{
	/*
	Vector2 class
	requires Math from standard library which requires no script inclusion
	*/
	constructor(x,y){
		this.x=x;
		this.y=y;
	}
	
	magnitude(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	phase(){
		return Math.atan2(this.y, this.x);
	}
	
	negate(){
		return new Vector2(-this.x, -this.y);
	}
	//TODO: Add rotate using 2x2 matrix trigonometric transform
	
	add(other){
		return new Vector2(this.x + other.x, this.y + other.y);
	}
	substract(other){
		return new Vector2(this.x - other.x, this.y - other.y);
	}
	
	
	normalize(){
		if(this.magnitude() > 0){
			return new Vector2(this.x / this.magnitude(), this.y / this.magnitude());
		}
		return new Vector2(0, 0);
	}
	scale(k){
		return new Vector2(this.x * k, this.y * k);
	}
	
	distance(other){
		return other.substract(this).magnitude();
	}
	angle(other){
		return Math.acos(this.normalize().dotProduct(other.normalize()));
	}
	direction(other){
		return other.substract(this).normalize();
	}
	
	dotProduct(other){
		return (this.x * other.x + this.y * other.y);
	}
}

var Vector2_ZERO = new Vector2(0, 0);
var Vector2_UP = new Vector2(0, -1);
var Vector2_DOWN = new Vector2(0, 1);
var Vector2_LEFT = new Vector2(-1, 0);
var Vector2_RIGHT = new Vector2(1, 0);

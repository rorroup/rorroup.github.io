
class Rectangle{
	constructor(position, size, color, lineWidth = 0){
		this.position = position;
		this.size = size;
		this.color = color;
		this.lineWidth = lineWidth;
	}
	
	draw(canvas2d, offset){
		canvas2d_drawRectangle(canvas2d, this.position.add(offset), this.size, this.color, this.lineWidth);
	}
	
	drawOutline(canvas2d, offset, outlineColor, outlineWidth){
		canvas2d_drawRectangle(canvas2d, this.position.add(offset).substract(new Vector2(outlineWidth, outlineWidth)), this.size.add(new Vector2(outlineWidth * 2, outlineWidth * 2)), outlineColor, 0);
	}
	
	hasCollidedPoint(point){
		return (point.x >= this.position.x && point.x <= this.position.add(this.size).x && point.y >= this.position.y && point.y <= this.position.add(this.size).y);
	}
	
	topCenter(){
		return this.position.add(new Vector2(this.size.x / 2, 0));
	}
}

class Picture{
	constructor(position, size, source){
		this.position = position;
		this.size = size;
		this.image_ = new Image();
		this.image_.src = source;
	}
	
	draw(canvas2d, offset){
		canvas2d.drawImage(this.image_, this.position.add(offset).x, this.position.add(offset).y, this.size.x, this.size.y);
	}
	
	drawOutline(canvas2d, offset, outlineColor, outlineWidth){
		canvas2d_drawRectangle(canvas2d, this.position.add(offset).substract(new Vector2(outlineWidth, outlineWidth)), this.size.add(new Vector2(outlineWidth * 2, outlineWidth * 2)), outlineColor, 0);
	}
	
	hasCollidedPoint(point){
		return (point.x >= this.position.x && point.x <= this.position.add(this.size).x && point.y >= this.position.y && point.y <= this.position.add(this.size).y);
	}
	
	topCenter(){
		return this.position.add(new Vector2(this.size.x / 2, 0));
	}
}

class Person{
	constructor(position, size, color, eyeColor = "#000000", heading = 3){
		this.position = position;
		this.size = size;
		this.color = color;
		this.eyeColor = eyeColor;
		this.eyeSize = this.size.scale(1 / 10).x;
		this.eyeShift = new Vector2(2.5 * this.eyeSize, 0);
		this.heading = heading;
	}
	
	draw(canvas2d, offset){
		canvas2d_drawRectangle(canvas2d, this.position.add(offset), this.size, this.color, 0);
		canvas2d_drawCircle(canvas2d, this.position.add(offset).add(new Vector2(this.size.x / 2, 0)), this.size.x / 2, this.color, 0);
		switch(this.heading){
			// case 0: // Up
				// break;
			case 1: // Left
				canvas2d_drawCircle(canvas2d, this.position.add(offset), this.eyeSize, this.eyeColor, 0);
				break;
			case 2: // Down
				canvas2d_drawCircle(canvas2d, this.position.add(offset).add(this.eyeShift), this.eyeSize, this.eyeColor, 0);
				canvas2d_drawCircle(canvas2d, this.position.add(offset).add(new Vector2(this.size.x, 0)).substract(this.eyeShift), this.eyeSize, this.eyeColor, 0);
				break;
			case 3: // Right
				canvas2d_drawCircle(canvas2d, this.position.add(offset).add(new Vector2(this.size.x, 0)), this.eyeSize, this.eyeColor, 0);
				break;
			default:
				break;
		}
	}
	
	drawOutline(canvas2d, offset, outlineColor, outlineWidth){
		canvas2d_drawRectangle(canvas2d, this.position.add(offset).substract(new Vector2(outlineWidth, outlineWidth)), this.size.add(new Vector2(outlineWidth * 2, outlineWidth * 2)), outlineColor, 0);
		canvas2d_drawCircle(canvas2d, this.position.add(offset).add(new Vector2(this.size.x / 2, 0)), this.size.x / 2 + outlineWidth, outlineColor, 0);
	}
	
	hasCollidedPoint(point){
		return (this.position.add(new Vector2(this.size.x / 2, 0)).distance(point) <= this.size.x / 2) || (point.x >= this.position.x && point.x <= this.position.add(this.size).x && point.y >= this.position.y && point.y <= this.position.add(this.size).y);
	}
	
	topCenter(){
		return this.position.add(new Vector2(this.size.x / 2, -this.size.y / 2));
	}
}


class Player{
	constructor(person){
		this.body = person;
		this.setTargetPosition(false);
		this.velocity = 3 * this.size.x; // px / s
	}
	
	get position(){ return this.body.position; }
	set position(position){ this.body.position = position; }
	get size(){ return this.body.size; }
	set size(size){ this.body.size = size; }
	
	update(timeDelta, blockers){
		if(this.position == this.positionTarget){
			return Vector2_ZERO;
		}
		let positionOld = this.position;
		let direction = this.position.direction(this.positionTarget);
		if(this.position.distance(this.positionTarget) < (timeDelta * this.velocity)){
			this.position = this.positionTarget;
		}else{
			this.position = this.position.add(direction.scale(this.velocity).scale(timeDelta));
		}
		
		for(let i = 0; i < blockers.length; i++){
			if(this.hasCollidedRectangle(blockers[i])){
				this.position = positionOld;
				this.setTargetPosition(false);
				break;
			}
		}
		
		this.body.heading = (Math.abs(direction.x) >= Math.abs(direction.y)) ? (Math.sign(direction.x) + 2) : (Math.sign(direction.y) + 1);
		
		return this.position.substract(positionOld);
	}
	
	draw(canvas2d, offset){
		this.body.draw(canvas2d, offset);
	}
	
	setTargetPosition(target){
		this.positionTarget = (target == false) ? this.position : target.substract(this.size.scale(1 / 2));
	}
	
	hasCollidedRectangle(rectangle){
		if(this.position.x > rectangle.position.x + rectangle.size.x) return false;
		if(this.position.x + this.size.x < rectangle.position.x) return false;
		if(this.position.y > rectangle.position.y + rectangle.size.y) return false;
		if(this.position.y + this.size.y < rectangle.position.y) return false;
		return true;
	}
}


class NPC{
	constructor(body, name, function_){
		this.body = body;
		this.name = name;
		this.function_ = function_;
		this.hovered = false;
	}
	
	set position(position){ this.body.position = position; }
	get position(){ return this.body.position; }
	set size(size){ this.body.size = size; }
	get size(){ return this.body.size; }
	
	draw(canvas2d, offset){
		if(this.hovered){
			this.drawOutline(canvas2d, offset, "#FF00FF", 7);
		}
		
		this.body.draw(canvas2d, offset);
		
		let textPoint = this.body.topCenter().add(offset).substract(new Vector2(0, 10));
		canvas2d.fillStyle = this.hovered ? "#FF00FF" : "#FFFFFF";
		canvas2d.font = "20px Georgia";
		canvas2d.textBaseline = "bottom";
		canvas2d.textAlign = "center";
		canvas2d.fillText(this.name, textPoint.x, textPoint.y);
	}
	
	drawOutline(canvas2d, offset, outlineColor = "red", outlineWidth = 2){
		this.body.drawOutline(canvas2d, offset, outlineColor, outlineWidth);
	}
	
	hasCollidedPoint(point){
		return this.body.hasCollidedPoint(point);
	}
	
	execute(){
		npc_active = this.function_();
		npc_run();
	}
}

class MapTiled{
	constructor(size, mapData, tileSize){
		this.size = size;
		this.tileSize = tileSize;
		
		this.tiles = [];
		for(let row = 0; row < mapData.tiles.length; row++){
			let y = [];
			for(let column = 0; column < mapData.tiles[row].length; column++){
				switch(mapData.tiles[row][column]){
					case "#":
						y.push(new Rectangle(new Vector2(this.tileSize.x * column, this.tileSize.y * row), this.tileSize, "#732626"));
						break;
					case ".":
						y.push(new Rectangle(new Vector2(this.tileSize.x * column, this.tileSize.y * row), this.tileSize, "#4D3319"));
						break;
					default:
						y.push(new Rectangle(new Vector2(this.tileSize.x * column, this.tileSize.y * row), this.tileSize, "#FFFFFF"));
						break;
				}
			}
			this.tiles.push(y);
		}
		
		this.blockers = [];
		for(let block = 0; block < mapData.blockers.length; block++){
			this.blockers.push(new Rectangle(new Vector2(this.tileSize.x * mapData.blockers[block][0], this.tileSize.y * mapData.blockers[block][1]), new Vector2(this.tileSize.x * mapData.blockers[block][2], this.tileSize.y * mapData.blockers[block][3]), "red", 2));
		}
		
		this.player = new Player(new Person(new Vector2(this.tileSize.x * mapData.bodies.player[0], this.tileSize.y * mapData.bodies.player[1]), new Vector2(this.tileSize.x * mapData.bodies.player[2], this.tileSize.y * mapData.bodies.player[3]), "#999999", "#000000", 3));
		this.offset = this.size.scale(1 / 2).substract(this.player.position.add(this.player.size.scale(1 / 2)));
		
		this.npc = [];
		this.npc.push(new NPC(new Person(new Vector2(this.tileSize.x * mapData.bodies.receptionist[0], this.tileSize.y * mapData.bodies.receptionist[1]), new Vector2(this.tileSize.x * mapData.bodies.receptionist[2], this.tileSize.y * mapData.bodies.receptionist[3]), "#222222", "#FFFFFF", 2), "Information", npc_information));
		this.npc.push(new NPC(new Picture(new Vector2(this.tileSize.x * mapData.bodies.resume[0], this.tileSize.y * mapData.bodies.resume[1]), new Vector2(this.tileSize.x * mapData.bodies.resume[2], this.tileSize.y * mapData.bodies.resume[3]), "asset/statistics.png"), "Resume", npc_resume));
		
		let clickedPosition = this.size.scale(1 / 2);
		this.eventMouse = {buttons: 0, offsetX: clickedPosition.x, offsetY: clickedPosition.y};
		this.clickedPosition = clickedPosition.substract(this.offset);
	}
	
	update(timeDelta){
		if(npc_active == false){
			if(this.eventMouse.buttons & 1){
				let mousePosition = this.eventMouse;
				let mousePoint = mousePosition.substract(this.offset);
				this.clickedPosition = mousePoint;
				
				this.player.setTargetPosition(mousePoint);
			}
		}
		
		this.offset = this.offset.substract(this.player.update(timeDelta, this.blockers));
	}
	
	draw(canvas2d){
		canvas2d_clearCanvas(canvas2d, this.size, "#000000");
		
		let offset = new Vector2(Math.round(this.offset.x), Math.round(this.offset.y)); // Avoid drawing floating point error
		// TODO: draw only stuff within the viewport.
		for(let y = 0; y < this.tiles.length; y++){
			for(let x = 0; x < this.tiles[y].length; x++){
				this.tiles[y][x].draw(canvas2d, offset);
			}
		}
		
		for(let i = 0; i < this.npc.length; i++){
			this.npc[i].draw(canvas2d, offset);
		}
		
		this.player.draw(canvas2d, offset);
	}
	
	registerEventMouse(event_){
		if(npc_active == false){
			let buttonsPrevious = this.eventMouse.buttons;
			
			let mousePosition = new Vector2(event_.offsetX, event_.offsetY);
			let mousePoint = mousePosition.substract(this.offset);
			
			this.eventMouse = mousePosition;
			this.eventMouse.buttons = event_.buttons;
			
			let selected = -1;
			let i;
			for(i = 0; i < this.npc.length; i++){
				if(this.npc[i].hasCollidedPoint(mousePoint)){
					this.npc[i].hovered = true;
					selected = i;
					break;
				}else{
					this.npc[i].hovered = false;
				}
			}
			for(i += 1; i < this.npc.length; i++){
				this.npc[i].hovered = false;
			}
			
			if(event_.buttons & 1){
				this.clickedPosition = mousePoint;
				if(~buttonsPrevious & 1){
					if(selected >= 0){
						this.player.setTargetPosition(false);
						this.eventMouse.buttons = 0;
						this.npc[selected].execute();
					}
				}
			}
		}
	}
}

class MapAnimation{
	constructor(){
		this.canvas = document.getElementById("demo_canvas");
		this.canvasSize = new Vector2(this.canvas.offsetWidth, this.canvas.offsetHeight);
		this.canvas.width = this.canvasSize.x;
		this.canvas.height = this.canvasSize.y;
		this.display = this.canvas.getContext("2d");
		let level = {
			tiles: [
				"###############",
				"###############",
				"#.............#",
				"#.............#",
			],
			blockers: [
				[1, 1, 13, 1],
				[0, 2, 1, 2],
				[14, 2, 1, 2],
				[1, 4, 13, 1],
			],
			bodies: {
				player: [1.5, 2.5, 1, 1],
				receptionist: [3, 1.5, 1, 1],
				resume: [6.5, 0.5, 1, 1],
			},
		};
		let tileSize = new Vector2(64, 64);
		this.map_ = new MapTiled(this.canvasSize, level, tileSize);
	}
	
	update(){
		this.map_.update(this.timeDelta);
	}
	
	draw(){
		this.map_.draw(this.display);
	}
	
	delegateEventMouse(event_){
		this.map_.registerEventMouse(event_);
	}
}

let navmap = new MapAnimation();


function hideInstruction(){
	document.getElementById("demo_instruction").style.display = "none";
	document.getElementById("demo_wrapper").removeEventListener("mousedown", hideInstruction);
}

document.getElementById("demo_wrapper").addEventListener("mousedown", hideInstruction);



document.getElementById("demo_wrapper").addEventListener("mousedown", function(event_){
	navmap.delegateEventMouse(event_);
});

document.getElementById("demo_wrapper").addEventListener("mouseup", function(event_){
	navmap.delegateEventMouse(event_);
});

document.getElementById("demo_wrapper").addEventListener("mousemove", function(event_){
	navmap.delegateEventMouse(event_);
});


function navmap_play(){
	// Update
	this.timeDelta = (this.timeFrameCurrent - this.timeFrameLast) / 1000.0;
	this.update();
	
	// Draw
	this.draw();
}


animation_initAnimationComponent(navmap, navmap_play, {}, true);
navmap.mayResume = (navmap.animationID != 0);

// Pause Animation on Losing Visibility
document.addEventListener("visibilitychange", (event_) => {
	switch(document.visibilityState){
		case "visible":
			if(navmap.animationID == 0){
				if(navmap.mayResume){
					navmap.animationID = requestAnimationFrame(navmap.animationStart);
				}
			}
			break;
		case "hidden":
			navmap.mayResume = (navmap.animationID != 0);
			if(navmap.animationID != 0){
				cancelAnimationFrame(navmap.animationID);
				navmap.animationID = 0;
			}
			break;
		default:
			break;
	}
});

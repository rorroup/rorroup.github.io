
/*
	Library to erase and draw on Canvas.
*/

/* Requires
Vector2.js
*/


function canvas2d_clearCanvas(ctx, canvasSize, color = "#FFFFFF")
{
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvasSize.x, canvasSize.y);
}

function canvas2d_drawRectangle(ctx, position, size, color = "#000000", lineWidth = 1)
{
	if(lineWidth == 0){
		ctx.fillStyle = color;
		ctx.fillRect(position.x, position.y, size.x, size.y);
	}else{
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.strokeRect(position.x, position.y, size.x, size.y);
	}
}

function canvas2d_drawCircle(ctx, center, radius, color = "#000000", lineWidth = 1)
{
	ctx.beginPath();
	ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
	if(lineWidth == 0){
		ctx.fillStyle = color;
		ctx.fill();
	}else{
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}

function canvas2d_drawPolyline(ctx, points, color = "#000000", lineWidth = 1)
{
	if(points.length >= 2){
		ctx.beginPath();
		ctx.moveTo(points[0].x,points[0].y);
		for(let i = 1; i < points.length; i++){
			ctx.lineTo(points[i].x, points[i].y);
		}
		if(lineWidth == 0){
			ctx.fillStyle = color;
			ctx.fill();
		}else{
			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		}
	}
}

function canvas2d_drawPoint(ctx, point, color = "#000000", width = 1)
{
	canvas2d_drawCircle(ctx, point, (width + 1) / 2, color, 0);
}

function canvas2d_drawEpicycles(ctx, epicycles, offset, color = "#000000", lineWidth = 1)
{
	let origin = new Vector2(0, 0);
	for(let i = 0; i < epicycles.length; i++){
		canvas2d_drawCircle(ctx, origin.add(offset), epicycles[i].magnitude(), color, lineWidth);
		origin = origin.add(epicycles[i]);
	}
	canvas2d_drawPoint(ctx, origin.add(offset), color, 2 * lineWidth);
}

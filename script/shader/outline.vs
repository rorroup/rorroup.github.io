
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

varying highp vec2 vTextureCoord;

void main(){
	gl_Position = vec4(aVertexPosition.xy, -1.0, 1.0);
	vTextureCoord = aTextureCoord;
}

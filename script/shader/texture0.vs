
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uVertexRotation;
uniform mat4 uVertexTranslation;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;

void main(void){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uVertexTranslation * uVertexRotation * aVertexPosition;
	vTextureCoord = aTextureCoord;
}

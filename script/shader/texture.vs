
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uRotationMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;

varying highp vec2 vTextureCoord;

void main(void){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uModelViewMatrix * uRotationMatrix * aVertexPosition;
	vTextureCoord = aTextureCoord;
}

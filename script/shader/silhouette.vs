
attribute vec4 aVertexPosition;

uniform mat4 uRotationMatrix;
uniform mat4 uModelViewMatrix;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;
uniform mat4 uProjectionMatrix;

void main(){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uModelViewMatrix * uRotationMatrix * aVertexPosition;
}

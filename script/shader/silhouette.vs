
attribute vec4 aVertexPosition;

uniform mat4 uVertexRotation;
uniform mat4 uVertexTranslation;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;
uniform mat4 uProjectionMatrix;

void main(){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uVertexTranslation * uVertexRotation * aVertexPosition;
}

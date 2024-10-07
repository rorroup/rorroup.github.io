
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uRotationMatrix;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;

uniform vec3 uVertexColor;
varying lowp vec4 vColor;

uniform vec3 uLightAmbient;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

uniform vec3 uSelected;

varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

void main(void){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uModelViewMatrix * uRotationMatrix * aVertexPosition;
	vTextureCoord = aTextureCoord;
	
	vColor = vec4(uVertexColor, 1.0);
	
	// Apply lighting effect
	
	vLighting = uLightAmbient + max(-dot(aVertexNormal, uLightDirection), 0.0) * uLightColor + uSelected;
}

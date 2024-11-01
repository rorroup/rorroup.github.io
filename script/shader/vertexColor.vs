
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uVertexRotation;
uniform mat4 uVertexTranslation;

uniform mat4 uCameraPosition;
uniform mat4 uCameraRotation;
uniform mat4 uProjectionMatrix;

uniform vec3 uVertexColor;
varying highp vec4 vColor;

uniform vec3 uLightAmbient;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

uniform vec3 uSelected;

varying highp vec3 vLighting;

void main(void){
	gl_Position = uProjectionMatrix * uCameraRotation * uCameraPosition * uVertexTranslation * uVertexRotation * aVertexPosition;
	
	vColor = vec4(uVertexColor, 1.0);
	
	// Apply lighting effect
	
	vLighting = uLightAmbient + max(-dot(aVertexNormal, uLightDirection), 0.0) * uLightColor + uSelected;
}

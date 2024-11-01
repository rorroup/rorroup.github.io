
varying highp vec3 vLighting;

varying lowp vec4 vColor;

void main(void){
	highp vec4 texelColor = vColor;
	
	gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}

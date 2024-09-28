varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;

varying lowp vec4 vColor;

void main(void){
	// highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
	highp vec4 texelColor = vColor;
	
	gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
}

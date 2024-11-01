
uniform sampler2D uSampler;
varying highp vec2 vTextureCoord;

uniform highp vec2 uTextureSize;

uniform lowp vec4 uOutlineColor;
uniform lowp float uOutlineSize;

void main(void){
	lowp vec4 texel = texture2D(uSampler, vTextureCoord); // Get current pixel.
	
	lowp vec2 texelScale = vec2(uOutlineSize, uOutlineSize) / uTextureSize;
	
	// Get neighbors.
	lowp vec4 sides = vec4(0.0);
	sides.x = texture2D(uSampler, vTextureCoord + vec2(0, texelScale.y)).a;
	sides.y = texture2D(uSampler, vTextureCoord + vec2(0, -texelScale.y)).a;
	sides.z = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, 0)).a;
	sides.w = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, 0)).a;
	
	lowp vec4 corners = vec4(0.0);
	corners.x = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, texelScale.y)).a;
	corners.y = texture2D(uSampler, vTextureCoord + vec2(texelScale.x, -texelScale.y)).a;
	corners.z = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, texelScale.y)).a;
	corners.w = texture2D(uSampler, vTextureCoord + vec2(-texelScale.x, -texelScale.y)).a;
	
	if(texel.a == 0.0 && dot(sides + corners, vec4(1.0)) > 0.0){
		gl_FragColor = uOutlineColor;
	}
	else{
		discard;
	}
}

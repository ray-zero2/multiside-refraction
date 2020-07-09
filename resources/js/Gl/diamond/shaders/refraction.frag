uniform sampler2D texture;
uniform sampler2D backTexture;
uniform vec2 resolution;

varying vec3 worldNormal;
varying vec3 viewDirection;

float ior = 2.42;
float a = 0.33;
// float a = 0.45;

vec3 reflectionColor = vec3(1.0);

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return min(pow( 1.0 + dot( eyeVector, worldNormal), 3.0 ), 1.0);
	// return min(pow( (1.0 + dot( eyeVector, worldNormal)) / 2.0, 3.0 ), 1.0);
}

void main() {
	// screen coordinates
	vec2 st = gl_FragCoord.xy / resolution;

	vec3 backfaceNormal = texture2D(backTexture, st).rgb;
	vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;
	// vec3 normal = mix(-backfaceNormal, worldNormal, a);

	// calculate refraction and apply to bst
	vec3 refracted = refract(viewDirection, normal, 1.0/ior);
	st += refracted.xy;

	vec4 tex = texture2D(texture, st);
	float f = Fresnel(viewDirection, normal);

	vec4 color = tex;
	vec3 outputColor = mix(color.rgb, reflectionColor, f);

	gl_FragColor = vec4(outputColor, 1.0);

}

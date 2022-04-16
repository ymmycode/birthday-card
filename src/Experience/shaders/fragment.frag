uniform float uTime;
uniform float animationMltiplier;

uniform sampler2D opacityMap;
uniform sampler2D emissiveMap;

uniform float opacityMultiplier;
uniform float emissiveMultiplier;

in vec2 vUV;

void main()
{
    vec4 opacity = texture2D(opacityMap, vUV) * opacityMultiplier;
    vec4 emissive = texture2D(emissiveMap, vUV) * emissiveMultiplier;

    emissive *= 1.5 + cos(uTime * animationMltiplier + (1.0 + sin(uTime * sin(uTime * animationMltiplier))));

    gl_FragColor = vec4(opacity * emissive);
}
uniform float uTime;
uniform float animationMltiplier2;

uniform sampler2D opacityMap;
uniform sampler2D emissiveMap;

uniform float opacityMultiplier;
uniform float emissiveMultiplier;

in vec2 vUV;

void main()
{
    vec4 opacity = texture2D(opacityMap, vUV) * opacityMultiplier;
    vec4 emissive = texture2D(emissiveMap, vUV) * emissiveMultiplier;

    emissive *= 1.5 + cos(uTime * animationMltiplier2 + (1.0 + cos(uTime * sin(uTime * animationMltiplier2))));

    gl_FragColor = vec4(opacity * emissive);
}
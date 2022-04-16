uniform float uTime;
uniform float animationMltiplier;
uniform vec2 uFrequency;

out vec2 vUV;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation =  sin(modelPosition.x * uFrequency.x - uTime * 3.0) * 0.1;
    elevation += sin(modelPosition.z * uFrequency.y + uTime * 3.0) * 0.1;

    modelPosition.x += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUV = uv;
}


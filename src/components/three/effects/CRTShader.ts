export const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    scanlineIntensity: { value: 0.2 },
    noiseIntensity: { value: 0.05 },
    vignetteIntensity: { value: 0.6 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float scanlineIntensity;
    uniform float noiseIntensity;
    uniform float vignetteIntensity;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;

      // Slight curve effect
      vec2 curved_uv = uv * 2.0 - 1.0;
      vec2 offset = curved_uv.yx * curved_uv.yx * curved_uv.yx * 0.1;
      uv = uv + offset;

      // Sample the texture
      vec4 texel = texture2D(tDiffuse, uv);

      // Scanlines
      float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04 * scanlineIntensity;
      texel.rgb -= scanline;

      // Noise
      float noise = random(uv + time) * noiseIntensity;
      texel.rgb += noise;

      // Vignette
      float vignette = length(curved_uv);
      vignette = 1.0 - vignette * vignetteIntensity;
      texel.rgb *= vignette;

      // RGB split
      float shift = 0.002;
      texel.r = texture2D(tDiffuse, vec2(uv.x + shift, uv.y)).r;
      texel.b = texture2D(tDiffuse, vec2(uv.x - shift, uv.y)).b;

      // Color adjustments
      texel.rgb = pow(texel.rgb, vec3(0.8));
      texel.rgb *= 1.2;

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = texel;
      }
    }
  `,
};
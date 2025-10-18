import * as THREE from 'three';

/**
 * Space Distortion Shader
 * Creates subtle radial distortion and atmospheric effects
 * Warps space itself rather than blurring particles
 */

export const SpaceDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    center: { value: new THREE.Vector2(0.5, 0.5) },
    distortionStrength: { value: 0.08 },
    vignetteStrength: { value: 0.12 },
    time: { value: 0.0 }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 center;
    uniform float distortionStrength;
    uniform float vignetteStrength;
    uniform float time;

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 toCenter = center - uv;
      float distance = length(toCenter);

      // Radial distortion - creates barrel effect
      // Space compresses toward edges, stretches from center
      float distortion = distortionStrength * distance * distance;
      vec2 distortedUV = uv + normalize(toCenter) * distortion;

      // Sample the scene with distorted coordinates
      vec4 color = texture2D(tDiffuse, distortedUV);

      // Subtle vignette for depth
      float vignette = 1.0 - smoothstep(0.5, 1.4, distance) * vignetteStrength;
      color.rgb *= vignette;

      // Very subtle chromatic aberration at edges for realism
      if (distance > 0.5) {
        float aberration = (distance - 0.5) * 0.003;
        float r = texture2D(tDiffuse, distortedUV + vec2(aberration, 0.0)).r;
        float b = texture2D(tDiffuse, distortedUV - vec2(aberration, 0.0)).b;
        color.r = mix(color.r, r, 0.5);
        color.b = mix(color.b, b, 0.5);
      }

      gl_FragColor = color;
    }
  `
};

/**
 * Space Distortion Pass for EffectComposer
 */
export class SpaceDistortionPass {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  enabled: boolean = true;
  renderToScreen: boolean = false;

  constructor(distortionStrength: number = 0.08, vignetteStrength: number = 0.12) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(SpaceDistortionShader.uniforms),
      vertexShader: SpaceDistortionShader.vertexShader,
      fragmentShader: SpaceDistortionShader.fragmentShader
    });

    this.material.uniforms.distortionStrength.value = distortionStrength;
    this.material.uniforms.vignetteStrength.value = vignetteStrength;

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.quad = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.quad);
  }

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ) {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }

    renderer.render(this.scene, this.camera);
  }

  setSize(_width: number, _height: number) {
    // Optional: adjust parameters based on size
    // Parameters are kept for interface compatibility
    void _width;
    void _height;
  }

  setDistortionStrength(strength: number) {
    this.material.uniforms.distortionStrength.value = strength;
  }

  setVignetteStrength(strength: number) {
    this.material.uniforms.vignetteStrength.value = strength;
  }

  updateTime(time: number) {
    this.material.uniforms.time.value = time;
  }

  dispose() {
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}

// Keep old export name for compatibility
export const RadialBlurPass = SpaceDistortionPass;

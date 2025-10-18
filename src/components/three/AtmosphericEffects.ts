import * as THREE from 'three';

/**
 * Atmospheric Effects for Space Scenes
 * Adds depth fog, ambient lighting, and subtle color grading
 */

export class AtmosphericEffects {
  scene: THREE.Scene;
  fog: THREE.Fog;
  ambientLight: THREE.AmbientLight;

  constructor(scene: THREE.Scene, useBackgroundColor: boolean = true) {
    this.scene = scene;

    // Deep space background color (slightly brighter) - only if no background image
    if (useBackgroundColor) {
      scene.background = new THREE.Color(0x000818);
    }

    // Exponential fog for depth
    // Very subtle - only affects very distant particles, preserving background visibility
    this.fog = new THREE.Fog(
      0x000818, // Dark blue-black fog color
      400,      // Start distance (pushed way back)
      900       // End distance (very far)
    );
    scene.fog = this.fog;

    // Brighter ambient light for overall visibility
    this.ambientLight = new THREE.AmbientLight(0x505070, 0.4);
    scene.add(this.ambientLight);
  }

  updateFogDensity(near: number, far: number) {
    this.fog.near = near;
    this.fog.far = far;
  }

  setBackgroundColor(color: number) {
    this.scene.background = new THREE.Color(color);
    this.fog.color.setHex(color);
  }

  dispose() {
    this.scene.remove(this.ambientLight);
  }
}

/**
 * Creates a subtle glow post-processing effect
 * Uses simple bloom-like brightening
 */
export const GlowShader = {
  uniforms: {
    tDiffuse: { value: null },
    glowStrength: { value: 0.25 },
    threshold: { value: 0.5 }
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
    uniform float glowStrength;
    uniform float threshold;

    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Extract bright areas
      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

      // Only glow bright pixels
      if (brightness > threshold) {
        float glow = (brightness - threshold) * glowStrength;
        color.rgb += vec3(glow);
      }

      gl_FragColor = color;
    }
  `
};

export class GlowPass {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  enabled: boolean = true;
  renderToScreen: boolean = false;

  constructor(glowStrength: number = 0.25, threshold: number = 0.5) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(GlowShader.uniforms),
      vertexShader: GlowShader.vertexShader,
      fragmentShader: GlowShader.fragmentShader
    });

    this.material.uniforms.glowStrength.value = glowStrength;
    this.material.uniforms.threshold.value = threshold;

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

  setGlowStrength(strength: number) {
    this.material.uniforms.glowStrength.value = strength;
  }

  setThreshold(threshold: number) {
    this.material.uniforms.threshold.value = threshold;
  }

  dispose() {
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}

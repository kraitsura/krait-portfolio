import * as THREE from 'three';

interface BackgroundStarsOptions {
  color?: number;
  size?: number;
  opacity?: number;
  rangeH: number;
  rangeV: number;
  depth: number; // How far back the layer is
  pointCount?: number;
  drift?: number; // Very slow drift speed (optional)
}

/**
 * Background Stars Layer
 * Creates a stationary or very slowly moving star field for depth
 */
export class BackgroundStars extends THREE.Group {
  points: THREE.Points;
  pointCount: number;
  drift: number;

  constructor(options: BackgroundStarsOptions) {
    super();

    // Create a tight, sharp gradient texture for distant stars
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const geometry = new THREE.BufferGeometry();
    const pointCount = options.pointCount || 500;
    const positions = new Float32Array(pointCount * 3);

    // Generate random positions for background stars
    for (let i = 0; i < pointCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(options.rangeH);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(options.rangeV);
      // Place all stars at the far back depth
      positions[i * 3 + 2] = -options.depth + THREE.MathUtils.randFloat(-10, 10);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: options.color || 0xFFFFFF,
      size: options.size || 0.3,
      map: texture,
      transparent: true,
      opacity: options.opacity || 0.6,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending // Makes stars glow slightly
    });

    this.points = new THREE.Points(geometry, material);
    this.add(this.points);

    this.pointCount = pointCount;
    this.drift = options.drift || 0;
  }

  update() {
    if (this.drift === 0) return;

    const positions = (this.points.geometry as THREE.BufferGeometry).attributes.position
      .array as Float32Array;

    // Very slow rotation/drift for subtle movement
    for (let i = 0; i < this.pointCount; i++) {
      const idx = i * 3;
      // Slowly rotate around center
      const x = positions[idx];
      const y = positions[idx + 1];
      const angle = this.drift * 0.001;

      positions[idx] = x * Math.cos(angle) - y * Math.sin(angle);
      positions[idx + 1] = x * Math.sin(angle) + y * Math.cos(angle);
    }

    (this.points.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}

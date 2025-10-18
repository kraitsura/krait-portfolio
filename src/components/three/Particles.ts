import * as THREE from 'three';

interface ParticlesOptions {
  color: number;
  size: number;
  rangeH: number;
  rangeV: number;
  rangeZ: number;
  pointCount: number;
  speed: number;
  exclusionRadius?: number; // Radius around center where particles won't spawn (0-1, as fraction of range)
}

export class Particles extends THREE.Group {
  points: THREE.Points;
  pointCount: number;
  rangeV: number;
  rangeH: number;
  rangeZ: number;
  speed: number;
  speedTarget: number;
  warpSpeed: number = 0;
  exclusionRadius: number;

  constructor(options: ParticlesOptions) {
    super();

    // Create a sharp point sprite texture (not a round circle)
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Create a radial gradient that's very tight and sharp
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    this.pointCount = options.pointCount;
    this.rangeV = options.rangeV;
    this.rangeH = options.rangeH;
    this.rangeZ = options.rangeZ;
    this.speed = this.speedTarget = options.speed;
    this.exclusionRadius = options.exclusionRadius || 0;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(options.pointCount * 3);
    const velocities = new Float32Array(options.pointCount * 3);
    const sizes = new Float32Array(options.pointCount);
    const colors = new Float32Array(options.pointCount * 3);

    for (let i = 0; i < options.pointCount; i++) {
      const pos = this.generatePositionOutsideExclusion();
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = THREE.MathUtils.randFloat(-options.rangeZ, 0);

      velocities[i * 3 + 2] = Math.random() * options.speed * 100;

      // Vary particle size (0.5x to 1.5x base size)
      sizes[i] = Math.random() * 0.5 + 0.75;

      // Add subtle color temperature variation
      const temp = Math.random();
      if (temp < 0.7) {
        // White stars (most common)
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      } else if (temp < 0.9) {
        // Slightly blue stars
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 1.0;
      } else {
        // Slightly warm stars
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.9;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: options.size || 0.2,
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.9
    });

    this.points = new THREE.Points(geometry, material);
    this.add(this.points);
  }

  // Generate a random position outside the exclusion zone
  private generatePositionOutsideExclusion(): { x: number; y: number } {
    if (this.exclusionRadius === 0) {
      return {
        x: THREE.MathUtils.randFloatSpread(this.rangeH),
        y: THREE.MathUtils.randFloatSpread(this.rangeV)
      };
    }

    // Calculate the actual exclusion radius based on the smaller range
    const minRange = Math.min(this.rangeH, this.rangeV);
    const exclusionDist = this.exclusionRadius * minRange * 0.5;

    let x: number, y: number, distance: number;

    // Keep generating until we get a position outside the exclusion zone
    do {
      x = THREE.MathUtils.randFloatSpread(this.rangeH);
      y = THREE.MathUtils.randFloatSpread(this.rangeV);
      distance = Math.sqrt(x * x + y * y);
    } while (distance < exclusionDist);

    return { x, y };
  }

  updateConstant() {
    const positions = (this.points.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;

    for (let i = 0; i < this.pointCount; i++) {
      const idx = i * 3;
      positions[idx + 2] += this.speed;

      if (positions[idx + 2] > 5) {
        const pos = this.generatePositionOutsideExclusion();
        positions[idx] = pos.x;
        positions[idx + 1] = pos.y;
        positions[idx + 2] = -this.rangeZ;
      }
    }

    (this.points.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
  }

  updateWithVelocity(shipVelocity: number) {
    // Base speed + proportional to ship velocity + warp speed during shoot-off
    const baseSpeed = 0.05;
    const velocityMultiplier = 3;
    const currentSpeed = baseSpeed + (shipVelocity * velocityMultiplier) + this.warpSpeed;

    const positions = (this.points.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;

    for (let i = 0; i < this.pointCount; i++) {
      const idx = i * 3;
      positions[idx + 2] += currentSpeed;

      if (positions[idx + 2] > 5) {
        const pos = this.generatePositionOutsideExclusion();
        positions[idx] = pos.x;
        positions[idx + 1] = pos.y;
        positions[idx + 2] = -this.rangeZ;
      }
    }

    (this.points.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
  }
} 
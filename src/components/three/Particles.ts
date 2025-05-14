import * as THREE from 'three';

interface ParticlesOptions {
  color: number;
  size: number;
  rangeH: number;
  rangeV: number;
  rangeZ: number;
  pointCount: number;
  speed: number;
}

export class Particles extends THREE.Group {
  points: THREE.Points;
  pointCount: number;
  rangeV: number;
  rangeH: number;
  rangeZ: number;
  speed: number;
  speedTarget: number;

  constructor(options: ParticlesOptions) {
    super();
    
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    ctx.beginPath();
    ctx.arc(64, 64, 42, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    const texture = new THREE.Texture(canvas);
    texture.premultiplyAlpha = true;
    texture.needsUpdate = true;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(options.pointCount * 3);
    const velocities = new Float32Array(options.pointCount * 3);

    for (let i = 0; i < options.pointCount; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(options.rangeH);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(options.rangeV);
      positions[i * 3 + 2] = THREE.MathUtils.randFloat(-options.rangeZ, 0);
      
      velocities[i * 3 + 2] = Math.random() * options.speed * 100;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: options.color || 0x333333,
      size: options.size || 0.4,
      map: texture,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, material);
    this.add(this.points);

    this.pointCount = options.pointCount;
    this.rangeV = options.rangeV;
    this.rangeH = options.rangeH;
    this.rangeZ = options.rangeZ;
    this.speed = this.speedTarget = options.speed;
  }

  updateConstant() {
    const positions = (this.points.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.pointCount; i++) {
      const idx = i * 3;
      positions[idx + 2] += this.speed;
      
      if (positions[idx + 2] > 5) {
        positions[idx] = THREE.MathUtils.randFloatSpread(this.rangeH);
        positions[idx + 1] = THREE.MathUtils.randFloatSpread(this.rangeV);
        positions[idx + 2] = -this.rangeZ;
      }
    }
    
    (this.points.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
  }
} 
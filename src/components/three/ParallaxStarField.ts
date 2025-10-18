import * as THREE from 'three';
import { Particles } from './Particles';
import { BackgroundStars } from './BackgroundStars';

/**
 * Multi-Layer Parallax Star Field
 * Creates depth through multiple layers moving at different speeds
 */
export class ParallaxStarField extends THREE.Group {
  private farLayer: BackgroundStars;
  private midLayer: Particles;
  private nearLayer: Particles;

  constructor() {
    super();

    // Layer 1: Far distant stars (stationary/very slow)
    this.farLayer = new BackgroundStars({
      color: 0x9999CC, // Slightly purple-blue for atmospheric depth
      size: 0.3,
      opacity: 0.7,
      rangeH: 200,
      rangeV: 200,
      depth: 400,
      pointCount: 1200,
      drift: 0.02 // Very subtle drift
    });
    this.add(this.farLayer);

    // Layer 2: Mid-depth stars (slow motion)
    this.midLayer = new Particles({
      color: 0xCCCCFF,
      size: 0.35,
      rangeH: 150,
      rangeV: 150,
      rangeZ: 100,
      pointCount: 1000,
      speed: 0.04,
      exclusionRadius: 0.4
    });
    // Position mid-layer back in space
    this.midLayer.position.z = -150;
    this.add(this.midLayer);

    // Layer 3: Near stars (normal motion)
    this.nearLayer = new Particles({
      color: 0xFFFFFF,
      size: 0.45,
      rangeH: 100,
      rangeV: 100,
      rangeZ: 50,
      pointCount: 2000,
      speed: 0.09,
      exclusionRadius: 0.4
    });
    this.add(this.nearLayer);
  }

  update() {
    // Update all layers
    this.farLayer.update();
    this.midLayer.updateConstant();
    this.nearLayer.updateConstant();
  }

  updateWithVelocity(velocity: number) {
    // Update with different parallax speeds
    this.farLayer.update();

    // Mid layer moves proportionally slower
    const midSpeed = velocity * 0.4;
    this.midLayer.speed = 0.04 + midSpeed;
    this.midLayer.updateConstant();

    // Near layer moves at full velocity
    this.nearLayer.updateWithVelocity(velocity);
  }

  dispose() {
    this.farLayer.dispose();
    // Note: Particles class doesn't have dispose yet, but we should add cleanup
  }
}

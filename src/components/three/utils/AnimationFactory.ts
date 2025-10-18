import * as THREE from 'three';

/**
 * AnimationFactory provides utilities for creating common animation clips
 * and keyframe tracks for Three.js animations
 */
export class AnimationFactory {
  /**
   * Create a position animation track
   */
  static createPositionTrack(
    targetPath: string,
    times: number[],
    positions: number[],
    interpolation: THREE.InterpolationModes = THREE.InterpolateSmooth
  ): THREE.VectorKeyframeTrack {
    return new THREE.VectorKeyframeTrack(
      `${targetPath}.position`,
      times,
      positions,
      interpolation
    );
  }

  /**
   * Create a rotation animation track
   */
  static createRotationTrack(
    targetPath: string,
    axis: 'x' | 'y' | 'z',
    times: number[],
    rotations: number[],
    interpolation: THREE.InterpolationModes = THREE.InterpolateSmooth
  ): THREE.NumberKeyframeTrack {
    return new THREE.NumberKeyframeTrack(
      `${targetPath}.rotation[${axis}]`,
      times,
      rotations,
      interpolation
    );
  }

  /**
   * Create a scale animation track
   */
  static createScaleTrack(
    targetPath: string,
    times: number[],
    scales: number[],
    interpolation: THREE.InterpolationModes = THREE.InterpolateSmooth
  ): THREE.VectorKeyframeTrack {
    return new THREE.VectorKeyframeTrack(
      `${targetPath}.scale`,
      times,
      scales,
      interpolation
    );
  }

  /**
   * Create a color animation track
   */
  static createColorTrack(
    targetPath: string,
    times: number[],
    colors: number[],
    interpolation: THREE.InterpolationModes = THREE.InterpolateSmooth
  ): THREE.ColorKeyframeTrack {
    return new THREE.ColorKeyframeTrack(
      targetPath,
      times,
      colors,
      interpolation
    );
  }

  /**
   * Create an opacity animation track
   */
  static createOpacityTrack(
    targetPath: string,
    times: number[],
    values: number[],
    interpolation: THREE.InterpolationModes = THREE.InterpolateSmooth
  ): THREE.NumberKeyframeTrack {
    return new THREE.NumberKeyframeTrack(
      `${targetPath}.opacity`,
      times,
      values,
      interpolation
    );
  }

  /**
   * Create a bounce animation clip
   */
  static createBounceClip(
    name: string,
    duration: number,
    height: number = 1,
    bounces: number = 3
  ): THREE.AnimationClip {
    const times: number[] = [];
    const positions: number[] = [];

    for (let i = 0; i <= bounces * 2; i++) {
      const t = (i / (bounces * 2)) * duration;
      times.push(t);

      if (i % 2 === 0) {
        positions.push(0, 0, 0); // Ground
      } else {
        const bounceHeight = height * Math.pow(0.5, Math.floor(i / 2));
        positions.push(0, bounceHeight, 0); // Peak
      }
    }

    const track = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      positions,
      THREE.InterpolateSmooth
    );

    return new THREE.AnimationClip(name, duration, [track]);
  }

  /**
   * Create a shake animation clip
   */
  static createShakeClip(
    name: string,
    duration: number,
    intensity: number = 0.1,
    frequency: number = 10
  ): THREE.AnimationClip {
    const samples = Math.floor(duration * frequency);
    const times: number[] = [];
    const positions: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * duration;
      times.push(t);

      const decay = 1 - (i / samples); // Decay over time
      const x = (Math.random() - 0.5) * intensity * decay;
      const y = (Math.random() - 0.5) * intensity * decay;
      const z = (Math.random() - 0.5) * intensity * decay;

      positions.push(x, y, z);
    }

    const track = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      positions,
      THREE.InterpolateLinear
    );

    return new THREE.AnimationClip(name, duration, [track]);
  }

  /**
   * Create a pulse scale animation clip
   */
  static createPulseClip(
    name: string,
    duration: number,
    minScale: number = 0.9,
    maxScale: number = 1.1,
    pulses: number = 3
  ): THREE.AnimationClip {
    const times: number[] = [];
    const scales: number[] = [];

    for (let i = 0; i <= pulses * 2; i++) {
      const t = (i / (pulses * 2)) * duration;
      times.push(t);

      const scale = i % 2 === 0 ? minScale : maxScale;
      scales.push(scale, scale, scale);
    }

    const track = new THREE.VectorKeyframeTrack(
      '.scale',
      times,
      scales,
      THREE.InterpolateSmooth
    );

    return new THREE.AnimationClip(name, duration, [track]);
  }

  /**
   * Create a spiral motion animation clip
   */
  static createSpiralClip(
    name: string,
    duration: number,
    radius: number = 5,
    height: number = 10,
    rotations: number = 3
  ): THREE.AnimationClip {
    const samples = 60; // 60 samples for smooth motion
    const times: number[] = [];
    const positions: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * duration;
      const angle = (i / samples) * Math.PI * 2 * rotations;
      const y = (i / samples) * height;

      times.push(t);
      positions.push(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
    }

    const track = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      positions,
      THREE.InterpolateSmooth
    );

    return new THREE.AnimationClip(name, duration, [track]);
  }

  /**
   * Create a fade in/out animation clip
   */
  static createFadeClip(
    name: string,
    duration: number,
    fadeIn: boolean = true,
    targetPath: string = '.material'
  ): THREE.AnimationClip {
    const track = new THREE.NumberKeyframeTrack(
      `${targetPath}.opacity`,
      [0, duration],
      fadeIn ? [0, 1] : [1, 0],
      THREE.InterpolateSmooth
    );

    return new THREE.AnimationClip(name, duration, [track]);
  }

  /**
   * Combine multiple clips into a single clip
   */
  static combineClips(
    name: string,
    clips: THREE.AnimationClip[]
  ): THREE.AnimationClip {
    let tracks: THREE.KeyframeTrack[] = [];
    let maxDuration = 0;

    for (const clip of clips) {
      tracks = tracks.concat(clip.tracks);
      maxDuration = Math.max(maxDuration, clip.duration);
    }

    return new THREE.AnimationClip(name, maxDuration, tracks);
  }

  /**
   * Create an easing curve for custom interpolation
   */
  static createEasingCurve(
    type: 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic',
    samples: number = 30
  ): number[] {
    const values: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      let value: number;

      switch (type) {
        case 'easeIn':
          value = t * t;
          break;
        case 'easeOut':
          value = t * (2 - t);
          break;
        case 'easeInOut':
          value = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          break;
        case 'bounce':
          if (t < 1 / 2.75) {
            value = 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            const t2 = t - 1.5 / 2.75;
            value = 7.5625 * t2 * t2 + 0.75;
          } else if (t < 2.5 / 2.75) {
            const t2 = t - 2.25 / 2.75;
            value = 7.5625 * t2 * t2 + 0.9375;
          } else {
            const t2 = t - 2.625 / 2.75;
            value = 7.5625 * t2 * t2 + 0.984375;
          }
          break;
        case 'elastic':
          const p = 0.3;
          const s = p / 4;
          value = t === 0 || t === 1
            ? t
            : Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
          break;
        default:
          value = t;
      }

      values.push(value);
    }

    return values;
  }

  /**
   * Apply easing to keyframe values
   */
  static applyEasing(
    values: number[],
    easingType: 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic'
  ): number[] {
    const easing = this.createEasingCurve(easingType, values.length - 1);
    const result: number[] = [];
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const range = endValue - startValue;

    for (let i = 0; i < easing.length; i++) {
      result.push(startValue + range * easing[i]);
    }

    return result;
  }
}
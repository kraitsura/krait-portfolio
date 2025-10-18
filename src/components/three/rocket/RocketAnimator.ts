import * as THREE from 'three';
import { RocketModel } from './RocketModel';
import { RocketState, SceneState } from './RocketState';

/**
 * Custom star field type with additional properties
 */
interface StarField extends THREE.Points {
  speedTarget?: number;
  warpSpeed?: number;
}

/**
 * Animation data structure for tracking animation state
 */
interface AnimationData {
  startTime: number;
  duration: number;
  progress: number;
  isPlaying: boolean;
}

/**
 * Store initial values for reset
 */
interface InitialValues {
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Euler;
  rocketPosition: THREE.Vector3;
  rocketScale: THREE.Vector3;
  rocketRotation: number;
  fireScale: THREE.Vector3;
  backgroundColor: THREE.Color;
}

/**
 * RocketAnimator handles all animations using manual interpolation
 * Direct object control instead of AnimationMixer for better reliability
 */
export class RocketAnimator {
  private clock: THREE.Clock;

  // References to animated objects
  private camera: THREE.Camera;
  private rocketModel: RocketModel;
  private sceneContainer: THREE.Group;
  private stars: StarField | undefined; // Reference to particle system
  private scene: THREE.Scene;
  private state: RocketState;

  // Animation state
  private launchAnimation: AnimationData;
  private resetAnimation: AnimationData;
  private currentAnimation: 'launch' | 'reset' | 'idle' | null = null;

  // Initial values for reset
  private initialValues: InitialValues;

  // Animation callbacks
  private onLaunchComplete?: () => void;
  private onResetComplete?: () => void;

  constructor(
    camera: THREE.Camera,
    rocketModel: RocketModel,
    sceneContainer: THREE.Group,
    scene: THREE.Scene,
    state: RocketState,
    stars?: StarField
  ) {
    this.camera = camera;
    this.rocketModel = rocketModel;
    this.sceneContainer = sceneContainer;
    this.scene = scene;
    this.state = state;
    this.stars = stars;

    // Initialize animation system
    this.clock = new THREE.Clock();

    // Initialize animation data
    this.launchAnimation = {
      startTime: 0,
      duration: 2.0,
      progress: 0,
      isPlaying: false
    };

    this.resetAnimation = {
      startTime: 0,
      duration: 1.5,
      progress: 0,
      isPlaying: false
    };

    // Store initial values
    this.initialValues = {
      cameraPosition: this.camera.position.clone(),
      cameraRotation: this.camera.rotation.clone(),
      rocketPosition: this.rocketModel.position.clone(),
      rocketScale: this.rocketModel.scale.clone(),
      rocketRotation: this.rocketModel.rocketBody.rotation.y,
      fireScale: this.rocketModel.fire.scale.clone(),
      backgroundColor: (this.scene.background as THREE.Color).clone()
    };
  }

  /**
   * Easing function for smooth animation
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Ease out function
   */
  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Start the launch animation sequence
   */
  public startLaunch(callback?: () => void, onResetComplete?: () => void): void {
    if (!this.state.canShoot()) {
      console.warn('Cannot launch in current state:', this.state.state);
      return;
    }

    console.log('Starting launch animation');

    this.onLaunchComplete = callback;
    this.onResetComplete = onResetComplete;

    // Transition state
    this.state.transition(SceneState.PREPARING);
    this.state.transition(SceneState.LAUNCHING);

    // Setup launch animation
    this.launchAnimation.startTime = this.clock.getElapsedTime();
    this.launchAnimation.progress = 0;
    this.launchAnimation.isPlaying = true;
    this.currentAnimation = 'launch';

    // Store current positions as initial values for this animation
    this.storeCurrentValues();

    // Increase star speed for warp effect
    if (this.stars) {
      this.stars.speedTarget = 1.0;
      this.stars.warpSpeed = 5.0;
    }
  }

  /**
   * Store current values before animation
   */
  private storeCurrentValues(): void {
    this.initialValues.cameraPosition.copy(this.camera.position);
    this.initialValues.cameraRotation.copy(this.camera.rotation);
    this.initialValues.rocketPosition.copy(this.rocketModel.position);
    this.initialValues.rocketScale.copy(this.rocketModel.scale);
    this.initialValues.rocketRotation = this.rocketModel.rocketBody.rotation.y;
    this.initialValues.fireScale.copy(this.rocketModel.fire.scale);
    this.initialValues.backgroundColor.copy(this.scene.background as THREE.Color);
  }

  /**
   * Animate launch - camera pulls back, rocket shrinks
   */
  private animateLaunch(progress: number): void {
    const easedProgress = this.easeInOutCubic(progress);
    const fastProgress = this.easeOut(progress);

    // Camera animation - pull back dramatically
    this.camera.position.x = THREE.MathUtils.lerp(
      this.initialValues.cameraPosition.x,
      0,
      easedProgress
    );
    this.camera.position.y = THREE.MathUtils.lerp(
      this.initialValues.cameraPosition.y,
      6,
      easedProgress
    );
    this.camera.position.z = THREE.MathUtils.lerp(
      this.initialValues.cameraPosition.z,
      200,
      fastProgress // Use faster progress for z to create acceleration effect
    );

    // Camera shake at the beginning
    if (progress < 0.1) {
      const shakeAmount = (0.1 - progress) * 0.05;
      this.camera.rotation.z = Math.sin(progress * 100) * shakeAmount;
    } else {
      this.camera.rotation.z = 0;
    }

    // Rocket position - minimal movement
    this.rocketModel.position.x = 0;
    this.rocketModel.position.y = THREE.MathUtils.lerp(
      0,
      3,
      easedProgress
    );
    this.rocketModel.position.z = THREE.MathUtils.lerp(
      0,
      -5,
      easedProgress
    );

    // Rocket scale - dramatic shrinking
    const scale = THREE.MathUtils.lerp(1, 0.01, fastProgress);
    this.rocketModel.scale.set(scale, scale, scale);

    // Rocket rotation - spin
    this.rocketModel.rocketBody.rotation.y = this.initialValues.rocketRotation + (progress * Math.PI * 4);

    // Fire scale - INTENSE boost effect
    let fireScale = 0.06;
    let fireLength = 1.5; // Length multiplier for dramatic effect

    if (progress < 0.05) {
      // MASSIVE initial ignition burst
      fireScale = THREE.MathUtils.lerp(0.06, 0.35, progress * 20);
      fireLength = THREE.MathUtils.lerp(1.5, 2.5, progress * 20);
    } else if (progress < 0.1) {
      // Huge sustained thrust
      fireScale = THREE.MathUtils.lerp(0.35, 0.30, (progress - 0.05) * 20);
      fireLength = 2.5;
    } else if (progress < 0.3) {
      // Still very boosted
      fireScale = THREE.MathUtils.lerp(0.30, 0.20, (progress - 0.1) * 5);
      fireLength = THREE.MathUtils.lerp(2.5, 2.0, (progress - 0.1) * 5);
    } else if (progress < 0.6) {
      // Sustained powerful thrust
      fireScale = THREE.MathUtils.lerp(0.20, 0.12, (progress - 0.3) / 0.3);
      fireLength = THREE.MathUtils.lerp(2.0, 1.8, (progress - 0.3) / 0.3);
    } else {
      // Gradually reduce as rocket gets distant
      fireScale = THREE.MathUtils.lerp(0.12, 0.01, (progress - 0.6) / 0.4);
      fireLength = THREE.MathUtils.lerp(1.8, 1.0, (progress - 0.6) / 0.4);
    }

    // Apply scale with elongated flame for dramatic effect
    this.rocketModel.fire.scale.set(fireScale, fireScale * fireLength, fireScale);

    // Add flickering effect for realism
    const flicker = 1 + Math.sin(progress * 50) * 0.1;
    this.rocketModel.fire.scale.multiplyScalar(flicker);

    // Change fire color based on intensity - white-hot during boost
    if (this.rocketModel.fire.material && 'uniforms' in this.rocketModel.fire.material) {
      const fireMat = this.rocketModel.fire.material as THREE.ShaderMaterial;
      if (progress < 0.1) {
        // White-hot during initial burst
        fireMat.uniforms.color1.value.setRGB(1, 1, 1); // White
        fireMat.uniforms.color2.value.setRGB(0.7, 0.85, 1); // Light blue
      } else if (progress < 0.3) {
        // Transition from white-hot to normal
        const colorProgress = (progress - 0.1) / 0.2;
        fireMat.uniforms.color1.value.setRGB(
          1,
          THREE.MathUtils.lerp(1, 1, colorProgress),
          THREE.MathUtils.lerp(1, 0, colorProgress)
        ); // White to yellow
        fireMat.uniforms.color2.value.setRGB(
          THREE.MathUtils.lerp(0.7, 1, colorProgress),
          THREE.MathUtils.lerp(0.85, 0.48, colorProgress),
          THREE.MathUtils.lerp(1, 0, colorProgress)
        ); // Light blue to orange
      } else {
        // Normal fire colors
        fireMat.uniforms.color1.value.setRGB(1, 1, 0); // Yellow
        fireMat.uniforms.color2.value.setHex(0xff7b00); // Orange
      }
    }

    // Scene background - subtle fade to dark gray
    if (progress > 0.5) {
      const bgProgress = (progress - 0.5) * 2;
      const bgValue = THREE.MathUtils.lerp(0, 0.3, bgProgress);
      (this.scene.background as THREE.Color).setRGB(bgValue, bgValue, bgValue);
    }
  }

  /**
   * Start the reset animation
   */
  public startReset(): void {
    console.log('Starting reset animation');

    this.state.transition(SceneState.RESETTING);

    // Setup reset animation
    this.resetAnimation.startTime = this.clock.getElapsedTime();
    this.resetAnimation.progress = 0;
    this.resetAnimation.isPlaying = true;
    this.currentAnimation = 'reset';

    // Reset star speed
    if (this.stars) {
      this.stars.speedTarget = 0.1;
      this.stars.warpSpeed = 0;
    }
  }

  /**
   * Animate reset - return to original positions
   */
  private animateReset(progress: number): void {
    const easedProgress = this.easeInOutCubic(progress);

    // Camera smooth return
    this.camera.position.x = THREE.MathUtils.lerp(
      0,
      0,
      easedProgress
    );
    this.camera.position.y = THREE.MathUtils.lerp(
      6,
      2,
      easedProgress
    );
    this.camera.position.z = THREE.MathUtils.lerp(
      200,
      20,
      easedProgress
    );

    // Reset camera rotation
    this.camera.rotation.z = 0;

    // Rocket position return
    this.rocketModel.position.x = 0;
    this.rocketModel.position.y = THREE.MathUtils.lerp(
      3,
      0,
      easedProgress
    );
    this.rocketModel.position.z = THREE.MathUtils.lerp(
      -5,
      0,
      easedProgress
    );

    // Rocket scale return
    const scale = THREE.MathUtils.lerp(0.01, 1, easedProgress);
    this.rocketModel.scale.set(scale, scale, scale);

    // Rocket rotation reset
    const currentRotation = Math.PI * 4;
    this.rocketModel.rocketBody.rotation.y = THREE.MathUtils.lerp(
      currentRotation,
      0,
      easedProgress
    );

    // Fire scale reset
    const fireScale = THREE.MathUtils.lerp(0.02, 0.06, easedProgress);
    this.rocketModel.fire.scale.set(fireScale, fireScale, fireScale);

    // Reset fire colors to normal
    if (this.rocketModel.fire.material && 'uniforms' in this.rocketModel.fire.material) {
      const fireMat = this.rocketModel.fire.material as THREE.ShaderMaterial;
      fireMat.uniforms.color1.value.setRGB(1, 1, 0); // Yellow
      fireMat.uniforms.color2.value.setHex(0xff7b00); // Orange
    }

    // Scene background fade back to black
    const bgValue = THREE.MathUtils.lerp(0.3, 0, easedProgress);
    (this.scene.background as THREE.Color).setRGB(bgValue, bgValue, bgValue);
  }

  /**
   * Start idle animation
   */
  public startIdle(): void {
    if (this.state.state === SceneState.IDLE) {
      this.currentAnimation = 'idle';
      console.log('Started idle animation');
    }
  }

  /**
   * Animate idle state
   */
  private animateIdle(elapsedTime: number): void {
    // Subtle floating motion
    const floatY = Math.sin(elapsedTime * 0.5) * 0.1;
    this.rocketModel.position.y = floatY;

    // Subtle rotation
    const rotationY = Math.sin(elapsedTime) * 0.05;
    this.rocketModel.rocketBody.rotation.y = rotationY;
  }

  /**
   * Play click animation
   */
  public playClickAnimation(_direction: number = 1): void {
    if (!this.state.canInteract()) return;
    void _direction; // Keep for future use

    console.log('Playing click animation');

    // Quick rotation and scale pulse
    // This will be overridden by idle animation next frame, creating a quick effect

    // Increase star speed temporarily
    if (this.stars) {
      this.stars.speedTarget = 0.3;
      setTimeout(() => {
        if (this.stars) {
          this.stars.speedTarget = 0.1;
        }
      }, 400);
    }
  }

  /**
   * Handle launch animation completion
   */
  private onLaunchAnimationComplete(): void {
    console.log('Launch animation completed');

    if (this.onLaunchComplete) {
      this.onLaunchComplete();
    }

    // Start reset after a delay
    setTimeout(() => {
      this.startReset();
    }, 1000);
  }

  /**
   * Handle reset animation completion
   */
  private onResetAnimationComplete(): void {
    console.log('Reset animation completed');

    this.state.transition(SceneState.IDLE);
    this.startIdle();

    if (this.onResetComplete) {
      this.onResetComplete();
      this.onResetComplete = undefined;
    }
  }

  /**
   * Update animation system
   * Call this in the render loop
   */
  public update(_deltaTime?: number): void {
    const currentTime = this.clock.getElapsedTime();
    void _deltaTime; // Keep for future use

    // Update launch animation
    if (this.launchAnimation.isPlaying) {
      this.launchAnimation.progress = (currentTime - this.launchAnimation.startTime) / this.launchAnimation.duration;

      if (this.launchAnimation.progress >= 1) {
        this.launchAnimation.progress = 1;
        this.launchAnimation.isPlaying = false;
        this.animateLaunch(1);
        this.onLaunchAnimationComplete();
      } else {
        this.animateLaunch(this.launchAnimation.progress);
      }
    }

    // Update reset animation
    if (this.resetAnimation.isPlaying) {
      this.resetAnimation.progress = (currentTime - this.resetAnimation.startTime) / this.resetAnimation.duration;

      if (this.resetAnimation.progress >= 1) {
        this.resetAnimation.progress = 1;
        this.resetAnimation.isPlaying = false;
        this.animateReset(1);
        this.onResetAnimationComplete();
      } else {
        this.animateReset(this.resetAnimation.progress);
      }
    }

    // Update idle animation
    if (this.currentAnimation === 'idle' && !this.launchAnimation.isPlaying && !this.resetAnimation.isPlaying) {
      this.animateIdle(currentTime);
    }
  }

  /**
   * Set animation time scale for slow motion effects
   */
  public setTimeScale(_scale: number): void {
    // Could adjust clock speed if needed
    void _scale; // Keep for future use
  }

  /**
   * Dispose of animation resources
   */
  public dispose(): void {
    // Reset all animations
    this.launchAnimation.isPlaying = false;
    this.resetAnimation.isPlaying = false;
    this.currentAnimation = null;
  }
}
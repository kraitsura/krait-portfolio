import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { Particles } from './Particles';
import { RocketModel } from './rocket/RocketModel';
import { RocketAnimator } from './rocket/RocketAnimator';
import { RocketState, SceneState } from './rocket/RocketState';
import { CRTShader } from './effects/CRTShader';

/**
 * Main RocketScene class - orchestrates all components
 * Refactored to use Three.js AnimationMixer instead of TWEEN.js
 */
export class RocketScene {
  // Core Three.js components
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer!: EffectComposer;
  private clock: THREE.Clock;

  // Scene hierarchy
  private sceneRoot!: THREE.Group;
  private viewContainer!: THREE.Group;
  private rocketContainer!: THREE.Group;

  // Components
  private rocketModel!: RocketModel;
  private particles!: Particles;
  private animator!: RocketAnimator;
  private state!: RocketState;

  // Interaction
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private interactionPlane!: THREE.Plane;
  private rocketTarget: THREE.Vector3 = new THREE.Vector3();
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 2, 20);
  private mouseTrackingEnabled: boolean = true;

  // Event handlers
  private mousemoveHandler: ((e: MouseEvent) => void) | null = null;
  private mousedownHandler: ((e: MouseEvent) => void) | null = null;
  private mouseupHandler: ((e: MouseEvent) => void) | null = null;
  private rafId: number | null = null;

  // Animation state
  private idleRotationSpeed: number = 3; // Degrees per second
  private time: number = 0;

  constructor(container: HTMLDivElement) {
    // Initialize clock
    this.clock = new THREE.Clock();

    // Initialize state management
    this.state = new RocketState();

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.cursor = 'default';
    container.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    this.camera.position.set(0, 2, 20);

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 15, 30);

    // Setup scene hierarchy
    this.setupSceneHierarchy();

    // Setup components
    this.setupLights();
    this.setupRocket();
    this.setupParticles();
    this.setupPostProcessing();
    this.setupInteraction();
    this.setupAnimator();

    // Start render loop
    this.animate();
  }

  /**
   * Setup the scene hierarchy to fix rotation issues
   */
  private setupSceneHierarchy(): void {
    // Root of all scene objects
    this.sceneRoot = new THREE.Group();
    this.sceneRoot.name = 'SceneRoot';
    this.scene.add(this.sceneRoot);

    // Container for applying the viewing angle
    this.viewContainer = new THREE.Group();
    this.viewContainer.name = 'ViewContainer';
    this.viewContainer.rotation.x = THREE.MathUtils.degToRad(-70); // Apply viewing angle here
    this.sceneRoot.add(this.viewContainer);

    // Container for the rocket (no rotation applied)
    this.rocketContainer = new THREE.Group();
    this.rocketContainer.name = 'RocketContainer';
    this.viewContainer.add(this.rocketContainer);
  }

  /**
   * Setup scene lighting
   */
  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.sceneRoot.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(0.7, 1, 1);
    this.sceneRoot.add(directionalLight);

    // Optional: Add a subtle point light that follows the rocket
    const rocketLight = new THREE.PointLight(0xffd700, 0.3, 10);
    rocketLight.position.y = -2;
    this.rocketContainer.add(rocketLight);
  }

  /**
   * Setup the rocket model
   */
  private setupRocket(): void {
    // Create rocket model
    this.rocketModel = new RocketModel();
    this.rocketContainer.add(this.rocketModel);
  }

  /**
   * Setup particle system
   */
  private setupParticles(): void {
    this.particles = new Particles({
      color: 0xffffff,
      size: 0.2,
      rangeH: 20,
      rangeV: 20,
      rangeZ: 30,
      pointCount: 200,
      speed: 0.1,
      exclusionRadius: 0.3 // Keep particles away from center where rocket is
    });
    this.sceneRoot.add(this.particles);
  }

  /**
   * Setup post-processing effects
   */
  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);

    // Main render pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // CRT effect pass
    const crtPass = new ShaderPass(CRTShader);
    this.composer.addPass(crtPass);
  }

  /**
   * Setup the animation system
   */
  private setupAnimator(): void {
    // Create the animator with references to all animated objects
    this.animator = new RocketAnimator(
      this.camera,
      this.rocketModel,
      this.rocketContainer,
      this.scene,
      this.state
      // Note: particles/stars functionality may need to be adapted
    );

    // Start idle animation
    this.state.on(SceneState.IDLE, () => {
      this.animator.startIdle();
    });

    // Handle state transitions
    this.state.on(SceneState.LAUNCHING, () => {
      console.log('Launching rocket!');
    });

    this.state.on(SceneState.RESETTING, () => {
      console.log('Resetting scene...');
    });

    // Start in idle state
    if (this.state.state === SceneState.IDLE) {
      this.animator.startIdle();
    }
  }

  /**
   * Setup mouse interaction
   */
  private setupInteraction(): void {
    // Create an invisible plane for mouse interaction
    this.interactionPlane = new THREE.Plane(
      new THREE.Vector3(0, 0.642, 0.766),
      0
    );

    // Throttled update function
    const updateTargets = () => {
      if (!this.state.canInteract() || !this.mouseTrackingEnabled) {
        this.rafId = null;
        return;
      }

      // Update camera target based on mouse position
      this.cameraTarget.x = -this.mouse.x * 2;
      this.cameraTarget.z = 20 + this.mouse.y * 2;

      // Update rocket target using raycaster
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.intersectPlane(this.interactionPlane, this.rocketTarget);

      this.rafId = null;
    };

    // Mouse move handler
    this.mousemoveHandler = (e: MouseEvent) => {
      if (!this.state.canInteract() || !this.mouseTrackingEnabled) return;

      // Update mouse coordinates
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Throttle updates using requestAnimationFrame
      if (this.rafId === null) {
        this.rafId = requestAnimationFrame(updateTargets);
      }
    };

    // Mouse down handler
    this.mousedownHandler = (e: MouseEvent) => {
      if (!this.state.canInteract()) return;

      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        'a, button, input, textarea, select, [role="button"]'
      );

      if (!isInteractive) {
        e.preventDefault();

        // Play click animation
        const direction = this.mouse.x < 0 ? -1 : 1;
        this.animator.playClickAnimation(direction);

        // Temporary boost to particles
        this.particles.speedTarget = 0.3;
      }
    };

    // Mouse up handler
    this.mouseupHandler = () => {
      if (!this.state.canInteract()) return;

      // Reset particle speed
      this.particles.speedTarget = 0.1;
    };

    // Register event listeners
    window.addEventListener('mousemove', this.mousemoveHandler);
    window.addEventListener('mousedown', this.mousedownHandler);
    window.addEventListener('mouseup', this.mouseupHandler);
  }

  /**
   * Main animation loop
   */
  private animate(): void {
    const animationLoop = () => {
      requestAnimationFrame(animationLoop);

      const deltaTime = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();
      this.time = elapsedTime;

      // Update animator (handles all animation clips)
      this.animator.update(deltaTime);

      // Update based on state
      if (this.state.canInteract()) {
        // Normal idle state updates
        this.updateIdleAnimations(deltaTime, elapsedTime);
        this.updateCameraPosition(deltaTime);
        this.updateRocketPosition(deltaTime);
      }

      // Always update these
      this.updateParticles(deltaTime);
      this.updateFireEffect(elapsedTime);
      this.updatePostProcessing(elapsedTime);

      // Render the scene
      this.composer.render();
    };

    animationLoop();
  }

  /**
   * Update idle animations
   */
  private updateIdleAnimations(deltaTime: number, elapsedTime: number): void {
    // Subtle idle rotation
    const rotationAngle = THREE.MathUtils.degToRad(this.idleRotationSpeed);
    this.rocketContainer.rotation.y = Math.cos(elapsedTime * 8) * rotationAngle;
  }

  /**
   * Smoothly update camera position
   */
  private updateCameraPosition(deltaTime: number): void {
    const lerpFactor = 1 - Math.pow(0.1, deltaTime);

    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x,
      this.cameraTarget.x,
      lerpFactor
    );

    this.camera.position.z = THREE.MathUtils.lerp(
      this.camera.position.z,
      this.cameraTarget.z,
      lerpFactor
    );
  }

  /**
   * Smoothly update rocket position
   */
  private updateRocketPosition(deltaTime: number): void {
    const lerpFactor = 1 - Math.pow(0.1, deltaTime);

    this.rocketContainer.position.x = THREE.MathUtils.lerp(
      this.rocketContainer.position.x,
      this.rocketTarget.x,
      lerpFactor
    );

    this.rocketContainer.position.y = THREE.MathUtils.lerp(
      this.rocketContainer.position.y,
      this.rocketTarget.y,
      lerpFactor
    );
  }

  /**
   * Update particle system
   */
  private updateParticles(deltaTime: number): void {
    // Update particles
    this.particles.updateConstant();

    // Smooth speed transitions
    const speedLerp = 1 - Math.pow(0.1, deltaTime);
    this.particles.speed = THREE.MathUtils.lerp(
      this.particles.speed,
      this.particles.speedTarget,
      speedLerp
    );
  }

  /**
   * Update fire flicker effect
   */
  private updateFireEffect(elapsedTime: number): void {
    this.rocketModel.updateFire(elapsedTime);
  }

  /**
   * Update post-processing uniforms
   */
  private updatePostProcessing(elapsedTime: number): void {
    // Update CRT shader time uniform
    if (this.composer.passes[1]) {
      const crtPass = this.composer.passes[1] as ShaderPass;
      if (crtPass.uniforms?.time) {
        crtPass.uniforms.time.value = elapsedTime;
      }
    }
  }

  /**
   * Public method to trigger the takeoff animation
   */
  public shootOff(callback?: () => void): void {
    console.log('RocketScene.shootOff() called');

    if (!this.state.canShoot()) {
      console.warn('Cannot shoot - current state:', this.state.state);
      return;
    }

    // Disable mouse tracking immediately
    this.mouseTrackingEnabled = false;
    console.log('Mouse tracking disabled');

    // Reset mouse position to center for smooth animation
    this.mouse.set(0, 0);
    this.rocketTarget.set(0, 0, 0);

    // Start the launch animation
    this.animator.startLaunch(() => {
      console.log('Launch animation complete');
      if (callback) {
        callback();
      }
    }, () => {
      // Callback for when reset completes
      this.mouseTrackingEnabled = true;
      this.mouse.set(0, 0);
      this.cameraTarget.set(0, 2, 20);
      console.log('Mouse tracking re-enabled');
    });
  }

  /**
   * Handle window resize
   */
  public handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Cleanup and dispose
   */
  public dispose(): void {
    // Cancel any pending RAF callbacks
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Remove event listeners
    if (this.mousemoveHandler) {
      window.removeEventListener('mousemove', this.mousemoveHandler);
      this.mousemoveHandler = null;
    }
    if (this.mousedownHandler) {
      window.removeEventListener('mousedown', this.mousedownHandler);
      this.mousedownHandler = null;
    }
    if (this.mouseupHandler) {
      window.removeEventListener('mouseup', this.mouseupHandler);
      this.mouseupHandler = null;
    }

    // Dispose components
    this.animator.dispose();
    this.rocketModel.dispose();

    // Remove canvas from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Dispose Three.js resources
    this.renderer.dispose();
    this.composer.dispose();
  }
}
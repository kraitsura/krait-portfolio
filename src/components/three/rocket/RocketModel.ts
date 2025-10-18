import * as THREE from 'three';

/**
 * RocketModel class handles the creation and management of the rocket 3D model
 * Separates model creation logic from scene management
 */
export class RocketModel extends THREE.Group {
  public rocketBody: THREE.Group;
  public fire!: THREE.Mesh;
  public wings: THREE.Group[] = [];

  // Store materials for potential updates
  private rocketMaterial!: THREE.MeshToonMaterial;
  private outlineMaterial!: THREE.ShaderMaterial;
  private fireMaterial!: THREE.ShaderMaterial;

  constructor() {
    super();
    this.name = 'RocketModel';

    // Create the rocket components
    this.rocketBody = new THREE.Group();
    this.rocketBody.name = 'RocketBody';

    // Position the rocket body
    this.rocketBody.position.y = -1.5;
    this.add(this.rocketBody);

    // Build the rocket
    this.createRocketBody();
    this.createWings();
    this.fire = this.createFire();
    this.rocketBody.add(this.fire);
  }

  /**
   * Create the main rocket body geometry
   */
  private createRocketBody(): void {
    // Define the rocket profile points
    const points: THREE.Vector2[] = [];
    points.push(new THREE.Vector2(0, 0));

    // Create a tapered rocket shape
    for (let i = 0; i < 11; i++) {
      const point = new THREE.Vector2(
        Math.cos(i * 0.227 - 0.75) * 8,
        i * 4.0
      );
      points.push(point);
    }
    points.push(new THREE.Vector2(0, 40));

    // Create the geometry using lathe
    const rocketGeometry = new THREE.LatheGeometry(points, 32);

    // Create materials
    this.rocketMaterial = new THREE.MeshToonMaterial({
      color: 0xcccccc,
    });

    // Create outline shader material
    this.outlineMaterial = this.createOutlineMaterial();

    // Create the rocket mesh group
    const rocketObject = new THREE.Group();
    rocketObject.name = 'RocketMesh';

    // Main rocket mesh
    const rocketMesh = new THREE.Mesh(rocketGeometry, this.rocketMaterial);
    rocketMesh.name = 'RocketMainBody';
    rocketObject.add(rocketMesh);

    // Outline mesh
    const outlineMesh = new THREE.Mesh(rocketGeometry, this.outlineMaterial);
    outlineMesh.name = 'RocketOutline';
    rocketObject.add(outlineMesh);

    // Scale down to appropriate size
    rocketObject.scale.setScalar(0.1);
    this.rocketBody.add(rocketObject);
  }

  /**
   * Create the outline shader material
   */
  private createOutlineMaterial(): THREE.ShaderMaterial {
    const outlineShader = {
      uniforms: {
        offset: { value: 0.3 },
        color: { value: new THREE.Color(0xd4af37) }, // Gold color
        alpha: { value: 1.0 },
      },
      vertexShader: `
        uniform float offset;
        void main() {
          vec4 pos = modelViewMatrix * vec4(position + normal * offset, 1.0);
          gl_Position = projectionMatrix * pos;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float alpha;
        void main() {
          gl_FragColor = vec4(color, alpha);
        }
      `,
    };

    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(outlineShader.uniforms),
      vertexShader: outlineShader.vertexShader,
      fragmentShader: outlineShader.fragmentShader,
      side: THREE.BackSide,
    });
  }

  /**
   * Create the rocket wings/fins
   */
  private createWings(): void {
    // Define wing shape - adjusted for better cylinder fit
    const shape = new THREE.Shape();
    shape.moveTo(2, 0);  // Start closer to rocket body
    shape.quadraticCurveTo(20, -8, 12, -37);  // Reduced outward extension
    shape.quadraticCurveTo(10, -21, 0, -20);  // Smoother curve back
    shape.lineTo(2, 0);

    // Extrude settings for 3D wing - reduced depth for better fit
    const extrudeSettings = {
      steps: 1,
      depth: 2,  // Reduced from 4 to 2 for less penetration
      bevelEnabled: true,
      bevelThickness: 1,  // Reduced from 2 to 1
      bevelSize: 1,  // Reduced from 2 to 1
      bevelSegments: 5,
    };

    // Create wing geometry
    const wingGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    wingGeometry.computeVertexNormals();

    // Wing material (gold color)
    const wingMaterial = new THREE.MeshToonMaterial({
      color: 0xd4af37,
    });

    // Wing outline material
    const wingOutlineMaterial = this.outlineMaterial.clone();
    wingOutlineMaterial.uniforms.offset.value = 1;

    // Create the first wing group
    const wingGroup = new THREE.Group();
    wingGroup.name = 'Wing1';

    // Wing mesh
    const wingMesh = new THREE.Mesh(wingGeometry, wingMaterial);
    wingGroup.add(wingMesh);

    // Wing outline
    const wingOutline = new THREE.Mesh(wingGeometry, wingOutlineMaterial);
    wingGroup.add(wingOutline);

    // Scale only (position will be set later)
    wingGroup.scale.setScalar(0.03);

    // Create all 4 wings and position them evenly around the rocket
    const height = 0.9; // Height on the rocket body

    for (let i = 0; i < 4; i++) {
      const wing = i === 0 ? wingGroup : wingGroup.clone();
      wing.name = `Wing${i + 1}`;

      // Calculate angle for this wing (0°, 90°, 180°, 270°)
      const angle = (Math.PI / 2) * i;

      // Use different radius for front/back wings vs side wings
      // Side wings (0° and 180°) use smaller radius
      // Front/back wings (90° and 270°) need more clearance
      const radius = (i === 1 || i === 3) ? 0.85 : 0.6;

      // Calculate position based on angle
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Set position and rotation
      wing.position.set(x, height, z);
      wing.rotation.y = angle;

      this.wings.push(wing);
      this.rocketBody.add(wing);
    }
  }

  /**
   * Create the fire/exhaust effect
   */
  private createFire(): THREE.Mesh {
    // Define fire cone shape
    const firePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const point = new THREE.Vector2(
        Math.sin(i * 0.18) * 8,
        (-10 + i) * 2.5
      );
      firePoints.push(point);
    }

    // Create fire geometry
    const fireGeometry = new THREE.LatheGeometry(firePoints, 32);

    // Create gradient fire shader material
    this.fireMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('yellow') },
        color2: { value: new THREE.Color(0xff7b00) }, // Orange
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
      `,
    });

    // Create fire mesh
    const fire = new THREE.Mesh(fireGeometry, this.fireMaterial);
    fire.name = 'RocketFire';
    fire.scale.setScalar(0.06);

    return fire;
  }

  /**
   * Update fire flicker effect
   */
  public updateFire(_time: number): void {
    void _time; // Keep for future use
    if (this.fire) {
      // Flicker effect
      this.fire.scale.y = THREE.MathUtils.randFloat(0.04, 0.08);
    }
  }

  /**
   * Set fire intensity for boost effect
   */
  public setFireIntensity(intensity: number): void {
    if (this.fire) {
      const scale = 0.06 * intensity;
      this.fire.scale.x = scale;
      this.fire.scale.z = scale;
      this.fire.scale.y = scale * 1.5; // Make it longer when boosting
    }
  }

  /**
   * Reset the model to initial state
   */
  public reset(): void {
    // Reset position
    this.position.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.scale.set(1, 1, 1);

    // Reset rocket body
    this.rocketBody.rotation.y = 0;
    this.rocketBody.scale.set(1, 1, 1);

    // Reset fire
    this.fire.scale.setScalar(0.06);
  }

  /**
   * Dispose of all geometries and materials
   */
  public dispose(): void {
    // Traverse and dispose all children
    this.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });

    // Clear arrays
    this.wings = [];
  }
}
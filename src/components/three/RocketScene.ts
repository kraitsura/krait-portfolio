import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { Particles } from './Particles';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

const CRTShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0 },
    'scanlineIntensity': { value: 0.3 },
    'noiseIntensity': { value: 0.1 },
    'vignetteIntensity': { value: 0.8 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float scanlineIntensity;
    uniform float noiseIntensity;
    uniform float vignetteIntensity;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      
      // Slight curve effect
      vec2 curved_uv = uv * 2.0 - 1.0;
      vec2 offset = curved_uv.yx * curved_uv.yx * curved_uv.yx * 0.1;
      uv = uv + offset;

      // Sample the texture
      vec4 texel = texture2D(tDiffuse, uv);
      
      // Scanlines
      float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04 * scanlineIntensity;
      texel.rgb -= scanline;

      // Noise
      float noise = random(uv + time) * noiseIntensity;
      texel.rgb += noise;

      // Vignette
      float vignette = length(curved_uv);
      vignette = 1.0 - vignette * vignetteIntensity;
      texel.rgb *= vignette;

      // RGB split
      float shift = 0.002;
      texel.r = texture2D(tDiffuse, vec2(uv.x + shift, uv.y)).r;
      texel.b = texture2D(tDiffuse, vec2(uv.x - shift, uv.y)).b;

      // Color adjustments
      texel.rgb = pow(texel.rgb, vec3(0.8));
      texel.rgb *= 1.2;

      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = texel;
      }
    }
  `
};

export class RocketScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rocketGroup!: THREE.Group;
  private stars!: Particles;
  private rocket!: THREE.Group;
  private fire!: THREE.Mesh;
  private rocketTarget!: THREE.Vector3;
  private cameraTarget!: THREE.Vector3;
  private composer!: EffectComposer;
  private time: number = 0;
  
  constructor(container: HTMLDivElement) {
    // Three.js setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // Set cursor style to default instead of pointer
    this.renderer.domElement.style.cursor = 'default';

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    this.camera.position.set(0, 2, 20);

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(this.scene.background, 15, 30);

    this.setupLights();
    this.setupRocket();
    this.setupStars();
    this.setupInteraction();
    this.animate();

    this.rocketTarget = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3().copy(this.camera.position);

    // Setup post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const crtPass = new ShaderPass(CRTShader);
    this.composer.addPass(crtPass);
  }

  private setupLights() {
    const aLight = new THREE.AmbientLight(0x555555);
    this.scene.add(aLight);

    const dLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    dLight1.position.set(0.7, 1, 1);
    this.scene.add(dLight1);
  }

  private setupRocket() {
    // Create rocket group
    this.rocketGroup = new THREE.Group();
    this.rocketGroup.rotation.x = THREE.MathUtils.degToRad(-70);
    this.scene.add(this.rocketGroup);

    this.rocket = new THREE.Group();
    this.rocket.position.y = -1.5;
    this.rocketGroup.add(this.rocket);

    // Body
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    for (let i = 0; i < 11; i++) {
      const point = new THREE.Vector2(
        Math.cos(i * 0.227 - 0.75) * 8,
        i * 4.0
      );
      points.push(point);
    }
    points.push(new THREE.Vector2(0, 40));

    const rocketGeo = new THREE.LatheGeometry(points, 32);
    const rocketMat = new THREE.MeshToonMaterial({
      color: 0xcccccc
    });

    const OutlineShader = {
      uniforms: {
        offset: { value: 0.3 },
        color: { value: new THREE.Color('#000000') },
        alpha: { value: 1.0 }
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
      `
    };

    const rocketOutlineMat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
      vertexShader: OutlineShader.vertexShader,
      fragmentShader: OutlineShader.fragmentShader,
      side: THREE.BackSide,
    });
    rocketOutlineMat.uniforms.color.value = new THREE.Color(0xd4af37);

    const rocketObj = new THREE.Group();
    rocketObj.add(new THREE.Mesh(rocketGeo, rocketMat));
    rocketObj.add(new THREE.Mesh(rocketGeo, rocketOutlineMat));
    rocketObj.scale.setScalar(0.1);
    this.rocket.add(rocketObj);

    // Add wings
    this.setupWings(rocketOutlineMat);

    // Setup fire effect
    this.setupFire();
  }

  private setupWings(rocketOutlineMat: THREE.ShaderMaterial) {
    const shape = new THREE.Shape();
    shape.moveTo(3, 0);
    shape.quadraticCurveTo(25, -8, 15, -37);
    shape.quadraticCurveTo(13, -21, 0, -20);
    shape.lineTo(3, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 5
    };

    const wingGroup = new THREE.Group();
    this.rocket.add(wingGroup);

    const wingGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    wingGeo.computeVertexNormals();
    const wingMat = new THREE.MeshToonMaterial({
      color: 0xd4af37
    });
    const wingOutlineMat = rocketOutlineMat.clone();
    wingOutlineMat.uniforms.offset.value = 1;

    const wing = new THREE.Group();
    wing.add(new THREE.Mesh(wingGeo, wingMat));
    wing.add(new THREE.Mesh(wingGeo, wingOutlineMat));
    wing.scale.setScalar(0.03);
    wing.position.set(0.6, 0.9, 0);
    wingGroup.add(wing);

    // Add other wings
    const wing2 = wingGroup.clone();
    wing2.rotation.y = Math.PI;
    this.rocket.add(wing2);

    const wing3 = wingGroup.clone();
    wing3.rotation.y = Math.PI / 2;
    this.rocket.add(wing3);

    const wing4 = wingGroup.clone();
    wing4.rotation.y = -Math.PI / 2;
    this.rocket.add(wing4);
  }

  private setupFire() {
    const firePoints = [];
    for (let i = 0; i <= 10; i++) {
      const point = new THREE.Vector2(
        Math.sin(i * 0.18) * 8,
        (-10 + i) * 2.5
      );
      firePoints.push(point);
    }

    const fireGeo = new THREE.LatheGeometry(firePoints, 32);
    const fireMat = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color('yellow') },
        color2: { value: new THREE.Color(0xff7b00) }
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

    this.fire = new THREE.Mesh(fireGeo, fireMat);
    this.fire.scale.setScalar(0.06);
    this.rocket.add(this.fire);
  }

  private setupStars() {
    this.stars = new Particles({
      color: 0xffffff,
      size: 0.2,
      rangeH: 20,
      rangeV: 20,
      rangeZ: 30,
      pointCount: 400,
      speed: 0.1
    });
    this.scene.add(this.stars);
  }

  private setupInteraction() {
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0.642, 0.766), 0);

    const mousemove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.cameraTarget.x = -mouse.x * 2;
      this.cameraTarget.z = 9 + mouse.y * 2;

      raycaster.setFromCamera(mouse, this.camera);
      raycaster.ray.intersectPlane(plane, this.rocketTarget);
    };

    const mousedown = (e: MouseEvent) => {
      e.preventDefault();
      
      TWEEN.removeAll();

      const dir = mouse.x < 0 ? -1 : 1;
      
      new TWEEN.Tween(this.rocket.rotation)
        .to({ y: dir * Math.PI }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEN.Tween(this.rocketGroup.scale)
        .to({ x: 0.9, y: 1.2, z: 0.9 }, 400)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();

      this.stars.speedTarget = 0.3;
    };

    const mouseup = () => {
      new TWEEN.Tween(this.rocketGroup.scale)
        .to({ x: 1, y: 1, z: 1 }, 400)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();

      this.stars.speedTarget = 0.1;
    };

    this.renderer.domElement.addEventListener('mousemove', mousemove);
    this.renderer.domElement.addEventListener('mousedown', mousedown);
    this.renderer.domElement.addEventListener('mouseup', mouseup);
  }

  private animate() {
    const clock = new THREE.Clock();
    let time = 0;
    const angle = THREE.MathUtils.degToRad(3);

    const lerp = (object: any, prop: string, destination: number) => {
      if (object && object[prop] !== destination) {
        object[prop] += (destination - object[prop]) * 0.1;
        if (Math.abs(destination - object[prop]) < 0.01) {
          object[prop] = destination;
        }
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();

      time += clock.getDelta();

      this.rocketGroup.rotation.y = Math.cos(time * 8) * angle;
      this.fire.scale.y = THREE.MathUtils.randFloat(0.04, 0.08);
      this.stars.updateConstant();

      lerp(this.rocketGroup.position, 'y', this.rocketTarget?.y || 0);
      lerp(this.rocketGroup.position, 'x', this.rocketTarget?.x || 0);
      lerp(this.camera.position, 'x', this.cameraTarget?.x || 0);
      lerp(this.camera.position, 'z', this.cameraTarget?.z || 0);
      lerp(this.stars, 'speed', this.stars.speedTarget);

      // Safely update CRT shader time uniform
      if (this.composer?.passes?.[1]) {
        const crtPass = this.composer.passes[1] as ShaderPass;
        crtPass.uniforms.time.value = time;
      }

      // Render with composer
      this.composer?.render();
    };

    animate();
  }

  public handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose() {
    this.renderer.dispose();
    this.composer.dispose();
  }
}

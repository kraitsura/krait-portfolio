declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import { WebGLRenderer, WebGLRenderTarget, Scene, Camera } from 'three';
    export class EffectComposer {
        constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
        render(): void;
        addPass(pass: any): void;
        setSize(width: number, height: number): void;
        dispose(): void;
        passes: any[];
    }
}

declare module 'three/examples/jsm/postprocessing/RenderPass' {
    import { Scene, Camera } from 'three';
    export class RenderPass {
        constructor(scene: Scene, camera: Camera);
        enabled: boolean;
    }
}

declare module 'three/examples/jsm/postprocessing/ShaderPass' {
    import { ShaderMaterial, Texture, Vector2 } from 'three';
    
    interface ShaderPassUniforms {
        [key: string]: {
            value: any;
        };
    }

    export class ShaderPass {
        constructor(shader: ShaderMaterial | {
            uniforms: ShaderPassUniforms;
            vertexShader: string;
            fragmentShader: string;
        });
        uniforms: ShaderPassUniforms;
        enabled: boolean;
        renderToScreen: boolean;
    }
}

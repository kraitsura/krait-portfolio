declare module 'three/examples/jsm/postprocessing/EffectComposer' {
    import { WebGLRenderer, WebGLRenderTarget } from 'three';

    interface Pass {
        enabled: boolean;
        renderToScreen?: boolean;
        render?: (renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget) => void;
        setSize?: (width: number, height: number) => void;
    }

    export class EffectComposer {
        constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
        render(): void;
        addPass(pass: Pass): void;
        setSize(width: number, height: number): void;
        dispose(): void;
        passes: Pass[];
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
    import { ShaderMaterial } from 'three';

    interface ShaderPassUniforms {
        [key: string]: {
            value: number | boolean | string | object | null;
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

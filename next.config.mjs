import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    sassOptions: {
        includePaths: [join(__dirname, 'styles')],
        modules: true,
    },
    // Performance optimizations
    experimental: {
        // Optimize imports for better tree-shaking
        optimizePackageImports: ['lucide-react', 'three', 'framer-motion'],
        // Enable React Compiler for automatic optimization
        reactCompiler: true,
        // Keep prefetched routes fresh longer for smoother navigation
        staleTimes: {
            dynamic: 30, // Cache dynamic routes for 30 seconds
            static: 180, // Cache static routes for 3 minutes
        },
    },
    // Compiler optimizations
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig;

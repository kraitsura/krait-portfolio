import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [], 
    },
    sassOptions: {
        includePaths: [join(__dirname, 'styles')],
        modules: true,
    },
}

export default nextConfig;

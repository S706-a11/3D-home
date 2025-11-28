import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5173,
        open: true,
    },
    build: {
        target: 'esnext',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    'three': ['three'],
                },
            },
        },
    },
    assetsInclude: ['**/*.glb', '**/*.gltf'],
    optimizeDeps: {
        include: ['three'],
    },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react()];

  if (process.env.REPORT || process.env.npm_config_report) {
    try {
      const { visualizer } = await import('rollup-plugin-visualizer');
      plugins.push(visualizer({ filename: 'dist/report.html', open: false }));
    } catch (e) {
      // plugin not installed, warn and continue
      // developer should run: npm i -D rollup-plugin-visualizer
      console.warn('rollup-plugin-visualizer not installed. Run: npm i -D rollup-plugin-visualizer');
    }
  }

  return {
    plugins,
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});

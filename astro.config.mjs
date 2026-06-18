// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
  // Custom domain → site served from the root (no base path needed).
  site: 'https://thaifoodproduct.com',
  integrations: [alpinejs({ entrypoint: '/src/alpine.entry.js' })],
  vite: {
    plugins: [tailwindcss()],
  },
});

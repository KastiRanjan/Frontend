import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Change to your desired host, e.g., 'localhost' or a specific IP
    port: 1039,      // Specify the port if needed
  },
});

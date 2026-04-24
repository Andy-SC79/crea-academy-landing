import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({

  
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'framer-motion';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) return 'react-vendor';
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) return 'i18n-vendor';
          if (id.includes('node_modules/lucide-react/')) return 'lucide';
        }
      }
    }
  },
  plugins: [react()],
resolve: {
alias: {
"@": path.resolve(__dirname, "./src"),
},
},
});


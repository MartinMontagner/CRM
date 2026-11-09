import react from '@vitejs/plugin-react';
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { defineConfig } from 'vite';

const env = process.env.ENV?.toUpperCase() || "DEV";
let dotenvConfig;
switch (env) {
  case "PROD":
    dotenvConfig = { path: ".env.prod" };
    break;
  default:
    dotenvConfig = { path: ".env.dev" };
    break;
}
const { parsed } = dotenv.config(dotenvConfig);
console.log("Loaded " + env + " environment\n");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    ...parsed,
    global: 'window',
    'process.env': {
      ...process.env,
      ...parsed,
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  },
  build: {
    outDir: "out",
  },
  server: env === "DEV" ? {
    open: true,
    port: 8901,
    https: {
      key: fs.readFileSync(
        process.env.HOME + "/.cocreadores/ssl/localhost-key.pem",
      ),
      cert: fs.readFileSync(
        process.env.HOME + "/.cocreadores/ssl/localhost.pem",
      ),
    },
  } : undefined,
})
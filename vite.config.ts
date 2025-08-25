import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { readFileSync } from "fs";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    // https: {
    //   key: readFileSync("key.pem"),
    //   cert: readFileSync("cert.pem"),
    // },
    // port: 443,
    // host: "localhost",
  },
});

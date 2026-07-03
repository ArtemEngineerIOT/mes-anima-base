import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const proxyTarget = env.VITE_DEV_PROXY_TARGET?.trim();

    if (mode === "development" && proxyTarget) {
        console.info(`[vite] proxy: http://localhost:<port>/rest/* -> ${proxyTarget}/rest/*`);
    } else if (mode === "development" && env.VITE_API_BASE_URL?.startsWith("/")) {
        console.warn(
            "[vite] VITE_API_BASE_URL относительный (%s), но VITE_DEV_PROXY_TARGET не задан — запросы к API могут вернуть 404.",
            env.VITE_API_BASE_URL,
        );
    }

    return {
        plugins: [react(), tsconfigPaths(), tailwindcss()],
        server: {
            ...(proxyTarget
                ? {
                      proxy: {
                          "/rest": {
                              target: proxyTarget,
                              changeOrigin: true,
                              secure: false,
                          },
                      },
                  }
                : {}),
        },
    };
});

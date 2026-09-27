import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const apiPlugin = () => ({
  name: "pitchengine-api",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url && req.url.startsWith("/api")) {
        try {
          const { handleApiRequest } = await import("./server/apiHandler");
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        } catch (e) {
          console.error("API middleware error:", e);
        }
      }
      next();
    });
  },
});

const seoPlugin = () => ({
  name: "pitchengine-seo",
  async transformIndexHtml(html: string, ctx: any) {
    const rawPath = (ctx.originalUrl || ctx.url || ctx.path || "").split("?")[0];
    if (
      !rawPath ||
      rawPath.startsWith("/api") ||
      rawPath.startsWith("/platform") ||
      rawPath.startsWith("/admin") ||
      rawPath.startsWith("/assets") ||
      rawPath.startsWith("/@") ||
      rawPath.startsWith("/src") ||
      rawPath.includes(".")
    ) {
      return html;
    }

    const slug = rawPath.replace(/^\/+|\/+$/g, "") || "max-quality-roofing";

    try {
      const { getTenantBySlug } = await import("./server/apiHandler");
      const { generateSeoMetadata, injectSeoIntoHtml } = await import("./src/lib/seoManager");
      const tenant = await getTenantBySlug(slug);

      if (tenant || slug === "max-quality-roofing") {
        const metadata = generateSeoMetadata(
          tenant,
          tenant?.completeData,
          tenant?.media,
          slug
        );
        return injectSeoIntoHtml(html, metadata);
      }
    } catch {
      // quiet fallback
    }

    return html;
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), apiPlugin(), seoPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  assetsInclude: ["**/*.jfif"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks — large libraries split out for better caching
          "vendor-react": ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-gsap": ["gsap"],
          "vendor-router": ["react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
    // Increase warning threshold slightly (we have large assets)
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "framer-motion",
      "gsap",
      "react-router-dom",
      "@tanstack/react-query",
    ],
  },
}));

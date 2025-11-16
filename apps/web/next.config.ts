import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    output: "standalone",
    reactStrictMode: false,
    devIndicators: false,
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
    },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    output: "standalone",
    devIndicators: false,
};

export default nextConfig;

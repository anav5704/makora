import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    output: "standalone",
    reactStrictMode: false,
};

export default nextConfig;

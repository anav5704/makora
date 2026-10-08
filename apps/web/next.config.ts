import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    output: "standalone",
    devIndicators: false,
    async rewrites() {
        const apiUrl = process.env.API_URL ?? "http://localhost:4000";
        return [
            {
                source: "/trpc/:path*",
                destination: `${apiUrl}/trpc/:path*`,
            },
            {
                source: "/api/auth/:path*",
                destination: `${apiUrl}/api/auth/:path*`,
            },
        ];
    },
};

export default nextConfig;

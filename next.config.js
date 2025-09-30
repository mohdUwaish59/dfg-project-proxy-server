/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel deployment
  distDir: '.next',
  images: {
    domains: [],
  },
  // Custom webpack config to handle the integration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Experimental features for better Vercel integration
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'sqlite3'],
  },
};

module.exports = nextConfig;
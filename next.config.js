/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  images: {
    domains: [],
  },
  // Custom webpack config to handle Node.js modules in serverless environment
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Let Next.js handle path aliases from tsconfig.json
    
    return config;
  },
  // Experimental features for better Vercel integration
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'sqlite3', 'express'],
  },
  // Serverless target is deprecated in Next.js 14, Vercel handles this automatically
};

module.exports = nextConfig;
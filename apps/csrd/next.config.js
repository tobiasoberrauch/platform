/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@digital-platform/ui'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'bufferutil' and 'utf-8-validate' on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

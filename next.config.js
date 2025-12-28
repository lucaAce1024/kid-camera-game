/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 支持MediaPipe等外部库
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;


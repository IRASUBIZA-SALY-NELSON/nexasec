/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Next.js 15: use remotePatterns instead of deprecated `domains`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  env: {
    NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
  },
  // swcMinify is the default in modern Next.js and the option is removed; do not set it
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

// Sentry configuration
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  nextConfig,
  {
    org: "byukusenge-andre",
    project: "javascript-nextjs-jz",
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,
    // See: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
    widenClientFileUpload: true,
    reactComponentAnnotation: { enabled: true },
    tunnelRoute: "/monitoring",
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);

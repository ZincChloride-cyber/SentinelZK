/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@midnight-ntwrk/compact-runtime',
    '@midnight-ntwrk/compact-js',
    '@midnight-ntwrk/midnight-js-contracts',
    '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
    '@midnight-ntwrk/midnight-js-network-id',
    '@midnight-ntwrk/midnight-js-types',
    '@midnight-ntwrk/midnight-js-utils',
    '@midnight-ntwrk/testkit-js',
    'ws',
    'pino',
    'pino-pretty',
  ],
}

export default nextConfig

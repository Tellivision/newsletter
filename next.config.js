/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub avatars
      'images.unsplash.com', // Template images
      'via.placeholder.com', // Placeholder images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // Ensure consistent URL handling for webhooks
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google Auth profile pictures
      }
    ],
  },
};

export default nextConfig;

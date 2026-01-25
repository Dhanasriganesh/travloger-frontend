/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tltuoosynajzlbvofzed.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'travloger-media-storage.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;




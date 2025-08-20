/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/", // when visiting root
        destination: "/landing", // go to /landing
        permanent: true, // 308 redirect (good for SEO); use false if you want temporary
      },
    ];
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login', // Redirige a la página de tickets
        permanent: true, // La redirección será permanente (código 301)
      },
    ];
  },
};


export default nextConfig;

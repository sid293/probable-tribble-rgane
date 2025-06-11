// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   webpack: (config) => {
//     config.watchOptions = {
//       poll: 1000,
//       aggregateTimeout: 300,
//       ignored: ['**/node_modules', '**/.git'],
//     };
//     return config;
//   },
//   reactStrictMode: true
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Enable hot reloading
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      }
    }
    return config
  },
};

export default nextConfig;

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];
  }
};

// Set port from environment variable
const PORT = parseInt(process.env.PORT || '3001', 10);
process.env.PORT = PORT.toString();

module.exports = withNextIntl(config);

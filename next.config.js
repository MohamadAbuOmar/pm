const createNextIntlPlugin = require('next-intl/plugin');

/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    typedRoutes: true
  }
};

const withNextIntl = createNextIntlPlugin('./src/i18n.config.ts');

module.exports = withNextIntl(config);

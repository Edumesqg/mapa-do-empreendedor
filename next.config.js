/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/cadastro', destination: '/diagnostico', permanent: false },
      { source: '/login', destination: '/diagnostico', permanent: false },
      { source: '/boas-vindas', destination: '/formulario-basico', permanent: false },
      { source: '/diagnostico', destination: '/formulario-basico', permanent: false },
      { source: '/dashboard', destination: '/swot', permanent: false },
      { source: '/swot-inicial', destination: '/swot', permanent: false },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Si el portal se despliega en un subdirectorio como /cesa, 
  // descomenta y ajusta la siguiente línea:
  // basePath: '/portal',
};

export default nextConfig;

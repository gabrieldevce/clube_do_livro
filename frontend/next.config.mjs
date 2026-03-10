/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://clube-do-livro-luwb.onrender.com';
    return [{ source: '/api/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;

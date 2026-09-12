/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Vercel無料枠での画像最適化制限を回避し、静的ファイルとして高速配信
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SIGNAL_PRICE_ADDRESS: process.env.SIGNAL_PRICE_ADDRESS,
    NEXT_PUBLIC_SIGNAL_FLOW_ADDRESS: process.env.SIGNAL_FLOW_ADDRESS,
    NEXT_PUBLIC_ALLOCATOR_ADDRESS: process.env.ALLOCATOR_ADDRESS,
  },
};

export default nextConfig;
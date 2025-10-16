/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'supabase.io',
      'placehold.co',
      'via.placeholder.com',
      'images.unsplash.com',
      'api.iconify.design'
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_NANO_BANANA_API_KEY: process.env.NEXT_PUBLIC_NANO_BANANA_API_KEY,
    NEXT_PUBLIC_MODE: process.env.NEXT_PUBLIC_MODE || 'local',
  },
}

module.exports = nextConfig
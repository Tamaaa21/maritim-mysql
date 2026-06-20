/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: user-uploaded images from Supabase storage use dynamic URLs
  // that Next.js cannot optimize at build time.
  images: { unoptimized: true },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

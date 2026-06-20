import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/display/", "/buku_tamu/"],
      },
    ],
    sitemap: "https://maritimtegal.bmkg.go.id/sitemap.xml",
  };
}

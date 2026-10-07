import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://smartmindstraining.co.uk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/design-system/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

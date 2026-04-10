import type { MetadataRoute } from "next";
import citiesData from "../../public/data/cities.json";

const BASE_URL = "https://dharmadoors.org";

interface CityEntry {
  slug: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = citiesData as CityEntry[];

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/sanghamap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/calendar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/dhammapada`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${BASE_URL}/sanghamap/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages];
}

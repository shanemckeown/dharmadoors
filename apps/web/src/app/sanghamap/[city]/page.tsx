import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, ExternalLink } from "lucide-react";
import { getTradition } from "@/data/traditionsData";
import citiesData from "../../../../public/data/cities.json";

interface CityEntry {
  slug: string;
  name: string;
  country: string;
  countryName: string;
  centerCount: number;
  center: [number, number];
  traditions: Record<string, number>;
  bounds: [[number, number], [number, number]];
}

const cities = citiesData as unknown as CityEntry[];

function getCity(slug: string): CityEntry | undefined {
  return cities.find((c) => c.slug === slug);
}

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: "City Not Found" };

  const title = `Buddhist Temples & Centers in ${city.name}, ${city.countryName}`;
  const description = `Find ${city.centerCount} Buddhist temples, meditation centers, and monasteries in ${city.name}. Filter by tradition — Theravada, Zen, Tibetan, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  // Sort traditions by count descending
  const sortedTraditions = Object.entries(city.traditions)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Buddhist Centers in ${city.name}`,
    description: `${city.centerCount} Buddhist temples and meditation centers in ${city.name}, ${city.countryName}`,
    numberOfItems: city.centerCount,
    itemListElement: sortedTraditions.map(([tradition, count], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${getTradition(tradition).label} centers`,
      description: `${count} ${getTradition(tradition).label} centers in ${city.name}`,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-[var(--color-warm-gray)]">
            <Link
              href="/"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              DharmaDoors
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-mist)]" />
            <Link
              href="/sanghamap"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              SanghaMap
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--color-mist)]" />
            <span className="text-[var(--foreground)] font-medium">
              {city.name}
            </span>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-light text-[var(--foreground)] mb-3"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          Buddhist Temples & Centers in {city.name}
        </h1>
        <p className="text-lg text-[var(--color-warm-gray)] mb-8">
          {city.centerCount} centers across {sortedTraditions.length} traditions
          in {city.name}, {city.countryName}
        </p>

        {/* View on Map CTA */}
        <Link
          href={`/sanghamap?q=${encodeURIComponent(city.name)}`}
          className="inline-flex items-center gap-2 px-5 py-3
            bg-[var(--color-saffron)] hover:bg-[var(--color-saffron-dark)]
            text-white rounded-xl font-medium text-base
            transition-colors mb-10"
        >
          <MapPin className="w-5 h-5" />
          View on Map
          <ExternalLink className="w-4 h-4 opacity-70" />
        </Link>

        {/* Tradition breakdown */}
        <section className="mb-12">
          <h2
            className="text-xl font-light text-[var(--foreground)] mb-5"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            Traditions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedTraditions.map(([tradition, count]) => {
              const t = getTradition(tradition);
              const pct = Math.round((count / city.centerCount) * 100);
              return (
                <div
                  key={tradition}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-sm text-[var(--foreground)] font-medium flex-1">
                    {t.label}
                  </span>
                  <span className="text-sm text-[var(--color-warm-gray)]">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Data attribution */}
        <footer className="border-t border-[var(--card-border)] pt-6 text-sm text-[var(--color-dharma-tan)]">
          <p>
            Data from{" "}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-saffron)]"
            >
              OpenStreetMap
            </a>
            . Help improve this data by{" "}
            <a
              href="https://www.openstreetmap.org/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-saffron)]"
            >
              contributing to OSM
            </a>
            .
          </p>
        </footer>
      </main>
    </div>
  );
}

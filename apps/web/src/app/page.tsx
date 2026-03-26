import Link from "next/link";
import { Map, BookOpen, Accessibility, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="container mx-auto px-6 py-24 md:py-32">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--foreground)] mb-6">
            DharmaDoors
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-3 tracking-wide">
            Opening doors to the dharma
          </p>
          <p className="text-base md:text-lg text-[var(--color-warm-gray)] dark:text-[var(--color-dharma-tan-light)] max-w-md mx-auto leading-relaxed">
            Digital tools for the Buddhist community
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          {/* SanghaMap - Active */}
          <Link
            href="/sanghamap"
            className="group relative bg-[var(--card-bg)] rounded-xl p-8
              shadow-md hover:shadow-lg
              border border-[var(--card-border)] hover:border-[var(--color-saffron)]/40
              transition-all duration-300
              hover:scale-[1.02]
              overflow-hidden"
          >
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-saffron)] rounded-l-xl" />

            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--color-saffron)] text-white text-xs font-semibold rounded-full shadow-sm">
              Live
            </div>

            <div className="w-12 h-12 rounded-lg bg-[var(--color-saffron)]/10 flex items-center justify-center mb-5">
              <Map className="w-6 h-6 text-[var(--color-saffron)]" />
            </div>

            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3 group-hover:text-[var(--color-saffron)] transition-colors">
              SanghaMap
            </h2>
            <p className="text-[var(--color-warm-gray)] dark:text-[var(--color-dharma-tan-light)] leading-relaxed text-sm">
              Find Buddhist temples, monasteries, and meditation centers worldwide.
              Filter by tradition, offerings, and location.
            </p>
          </Link>

          {/* DharmaHub - Coming Soon */}
          <div className="relative bg-[var(--color-mist)]/50 dark:bg-[var(--card-bg)]/30 rounded-xl p-8 opacity-70">
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--color-dharma-tan-light)]/80 text-[var(--color-deep-earth)] text-xs font-medium rounded-full">
              Coming Soon
            </div>

            <div className="w-12 h-12 rounded-lg bg-[var(--color-dharma-tan)]/10 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6 text-[var(--color-dharma-tan)]" />
            </div>

            <h2 className="text-xl font-semibold text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-3">
              DharmaHub
            </h2>
            <p className="text-[var(--color-warm-gray)] leading-relaxed text-sm">
              Aggregated Buddhist content - texts, audio, video, and courses from
              across traditions.
            </p>
          </div>

          {/* DharmaAccess - Active */}
          <Link
            href="/dhammapada"
            className="group relative bg-[var(--card-bg)] rounded-xl p-8
              shadow-md hover:shadow-lg
              border border-[var(--card-border)] hover:border-[var(--color-wisdom-blue)]/40
              transition-all duration-300
              hover:scale-[1.02]
              overflow-hidden"
          >
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-wisdom-blue)] rounded-l-xl" />

            <div className="absolute top-4 right-4 px-3 py-1.5 bg-[var(--color-wisdom-blue)] text-white text-xs font-semibold rounded-full shadow-sm">
              Live
            </div>

            <div className="w-12 h-12 rounded-lg bg-[var(--color-wisdom-blue)]/10 flex items-center justify-center mb-5">
              <Accessibility className="w-6 h-6 text-[var(--color-wisdom-blue)]" />
            </div>

            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3 group-hover:text-[var(--color-wisdom-blue)] transition-colors">
              DharmaAccess
            </h2>
            <p className="text-[var(--color-warm-gray)] dark:text-[var(--color-dharma-tan-light)] leading-relaxed text-sm">
              Read the Dhammapada with adjustable fonts, high contrast mode, and
              accessible design for all practitioners.
            </p>
          </Link>
        </div>

        {/* Philosophy */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 tracking-wide">
            Built with Dana
          </h3>
          <p className="text-[var(--color-warm-gray)] dark:text-[var(--color-dharma-tan-light)] mb-8 leading-relaxed">
            DharmaDoors is free for everyone and always will be. Following the
            Buddhist tradition of generosity, these tools are offered freely and
            sustained by donations.
          </p>
          <a
            href="https://github.com/Encrypted-S/dharmadoors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5
              bg-[var(--foreground)] text-[var(--background)]
              rounded-lg font-medium text-sm
              hover:scale-[0.98] active:scale-[0.96]
              transition-all duration-200
              shadow-sm hover:shadow-md"
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-[var(--color-warm-gray)] dark:text-[var(--color-dharma-tan)] max-w-lg mx-auto">
          <p className="mb-3 italic leading-relaxed">
            &quot;Thousands of candles can be lighted from a single candle, and the
            life of the candle will not be shortened.&quot;
          </p>
          <p className="text-[var(--color-dharma-tan)]">May all beings be happy.</p>
        </footer>
      </main>
    </div>
  );
}

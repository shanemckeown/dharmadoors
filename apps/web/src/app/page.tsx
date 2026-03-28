import Link from "next/link";
import { Github, MapPin, ArrowRight, Accessibility, Library } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        {/* Brand */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[var(--foreground)] mb-4"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          DharmaDoors
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-dharma-tan-dark)] dark:text-[var(--color-dharma-tan)] mb-12 tracking-wide text-center">
          Find sangha. Read the teachings. Practice together.
        </p>

        {/* Omni-search */}
        <form
          action="/sanghamap"
          className="w-full max-w-lg mb-16"
        >
          <div className="relative">
            <input
              type="text"
              name="q"
              placeholder="Search for a temple, city, or tradition..."
              className="w-full px-5 py-4 pr-12 rounded-full
                bg-[var(--card-bg)] text-[var(--foreground)]
                border border-[var(--card-border)]
                shadow-sm
                text-base
                placeholder:text-[var(--color-dharma-tan-light)]
                focus:outline-none focus:border-[var(--color-saffron)] focus:shadow-md
                transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full
                bg-[var(--color-saffron)] text-white
                flex items-center justify-center
                hover:bg-[var(--color-saffron-dark)]
                transition-colors duration-200"
              aria-label="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Entry points */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-10 mb-20 text-center">
          <Link
            href="/sanghamap"
            className="group flex items-center gap-3
              text-[var(--color-warm-gray)] hover:text-[var(--color-saffron)]
              transition-colors duration-200"
          >
            <MapPin className="w-5 h-5 text-[var(--color-saffron)] opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="text-base">
              <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--color-saffron)] transition-colors">51,000+</span>
              {" "}Buddhist centers
            </span>
          </Link>

          <Link
            href="/dhammapada"
            className="group flex items-center gap-3
              text-[var(--color-warm-gray)] hover:text-[var(--color-saffron)]
              transition-colors duration-200"
          >
            <Accessibility className="w-5 h-5 text-[var(--color-saffron)] opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="text-base">
              <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--color-saffron)] transition-colors">423</span>
              {" "}verses of the Dhammapada
            </span>
          </Link>

          <span
            className="flex items-center gap-3
              text-[var(--color-dharma-tan-light)] cursor-default"
          >
            <Library className="w-5 h-5 opacity-40" />
            <span className="text-base">
              DharmaHub <span className="text-sm opacity-70">coming soon</span>
            </span>
          </span>
        </div>

        {/* Dedication of Merit */}
        <div className="max-w-sm text-center mb-8">
          <p className="text-sm text-[var(--color-dharma-tan)] dark:text-[var(--color-dharma-tan-light)] italic leading-loose">
            May the merit of this action benefit all sentient beings.
            <br />
            May all beings be free from suffering and the causes of suffering.
            <br />
            May all beings find happiness and the causes of happiness.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-sm text-[var(--color-dharma-tan)] mb-4">
          Free for everyone. Built with dana.
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://github.com/shanemckeown/dharmadoors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5
              text-sm text-[var(--color-warm-gray)]
              hover:text-[var(--foreground)]
              transition-colors duration-200"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

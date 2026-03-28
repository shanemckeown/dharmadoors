# DharmaDoors 🚪

> Opening doors to the dharma - Buddhist digital tools for the modern practitioner

[![License: MIT](https://img.shields.io/badge/License-MIT-saffron.svg)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org)

## Vision

DharmaDoors is an open-source project creating accessible digital tools for the Buddhist community. Built with a **dana (generosity) model** - free for all, sustained by donations.

## Projects

| Project | Path | Status | Description |
|---------|------|--------|-------------|
| **SanghaMap** | `/sanghamap` | 🚧 In Development | Global Buddhist center finder with modern map interface |
| **DharmaHub** | `/dharmahub` | 📋 Planned | Aggregated Buddhist content (texts, audio, video) |
| **DharmaAccess** | `/dharmaaccess` | 📋 Planned | Accessibility tools for deaf/blind practitioners |

## SanghaMap Features

- 🗺️ Interactive map of Buddhist temples, monasteries, and centers
- 🔍 Filter by tradition (Theravada, Mahayana, Vajrayana, Zen, etc.)
- 📍 "Near me" geolocation search
- 🤝 Crowdsourced data - anyone can submit a center
- ❤️ Support struggling centers with fundraising integration
- 📰 Buddhist news aggregation

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap (free forever!)
- **Database:** PostgreSQL with PostGIS
- **Hosting:** Google Cloud Run
- **Future Mobile:** React Native / Expo

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Encrypted-S/dharmadoors.git
cd dharmadoors

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
dharmadoors/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # React Native app (future)
├── packages/
│   ├── api-client/          # Shared API client
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
└── README.md
```

## Contributing

We welcome contributions! This is a community project for the Buddhist community.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Dana (Donations)

DharmaDoors is free for everyone and always will be. If you find it useful, consider supporting:

- [Ko-fi](https://ko-fi.com/dharmadoors) (coming soon)
- [GitHub Sponsors](https://github.com/sponsors/Encrypted-S) (coming soon)

All donations go directly to hosting costs and development.

## License

MIT License - feel free to use, modify, and distribute.

## Acknowledgments

- The Buddhist community for inspiration
- [SuttaCentral](https://suttacentral.net) for their API and open approach
- [OpenStreetMap](https://openstreetmap.org) contributors
- [No Barriers Zen](https://nobarrierszen.org) for pioneering accessibility

---

May this be for the benefit of all beings. 🙏

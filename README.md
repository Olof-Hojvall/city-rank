# City Rank

Rate cities A–F on an interactive world map. Your rankings live entirely in the URL — no accounts, no backend.

**[Live app →](https://olofhojvall.github.io/city-rank/)**

## Features

- Browse ~55,000 cities (GeoNames `cities5000` dataset)
- Assign grades A–F to any city
- Rankings are compressed into the URL hash — copy the URL to save or share
- Filter the sidebar by rated/unrated cities
- Export your list as Markdown, CSV, or plain text
- Import a previously exported list

## Tech stack

- React + TypeScript + Vite
- MapLibre GL JS for WebGL map rendering
- Zustand for state management
- lz-string for URL compression
- shadcn/ui + Tailwind CSS

## Development

```bash
pnpm install
pnpm cities   # download and build cities.json from GeoNames
pnpm dev
```

## Deploy

Pushes to `main` automatically deploy to GitHub Pages via the CI workflow.

import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/cities.json');

// Natural Earth populated places — uses POP_MAX (urban agglomeration) instead of
// administrative city limits, so Paris (~10M) ranks above Berlin (~3.4M) correctly.
const NE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson';

type City = {
  id: number;
  name: string;
  country: string;
  admin1: string;
  lat: number;
  lng: number;
  pop: number;
};

async function main() {
  console.log('Downloading Natural Earth populated places...');
  const res = await fetch(NE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${NE_URL}`);
  const geojson = await res.json() as { features: Array<{ properties: Record<string, unknown>; geometry: { coordinates: [number, number] } }> };

  console.log('Parsing...');
  const cities: City[] = [];
  let id = 1;

  for (const feature of geojson.features) {
    const p = feature.properties;
    const pop = typeof p.POP_MAX === 'number' ? p.POP_MAX : 0;
    if (pop <= 0) continue;

    const iso2 = typeof p.ISO_A2 === 'string' && p.ISO_A2 !== '-99' ? p.ISO_A2 : String(p.ADM0_A3 ?? '');

    cities.push({
      id: id++,
      name: String(p.NAMEASCII ?? p.NAME ?? ''),
      country: iso2,
      admin1: typeof p.ADM1NAME === 'string' ? p.ADM1NAME : '',
      lat: typeof p.LATITUDE === 'number' ? p.LATITUDE : (feature.geometry.coordinates[1]),
      lng: typeof p.LONGITUDE === 'number' ? p.LONGITUDE : (feature.geometry.coordinates[0]),
      pop,
    });
  }

  await writeFile(OUT, JSON.stringify(cities), 'utf8');
  console.log(`Wrote ${cities.length} cities to ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

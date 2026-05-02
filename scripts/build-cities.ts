import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { createReadStream, mkdirSync, existsSync, unlinkSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public/cities.json');
const ZIP = '/tmp/cities5000.zip';
const TXT = '/tmp/cities5000.txt';

const GEONAMES_URL = 'https://download.geonames.org/export/dump/cities5000.zip';

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
  console.log('Downloading cities5000.zip...');
  execSync(`curl -L -o ${ZIP} ${GEONAMES_URL}`, { stdio: 'inherit' });

  console.log('Extracting...');
  execSync(`unzip -p ${ZIP} cities5000.txt > ${TXT}`);

  console.log('Parsing...');
  const cities: City[] = [];
  const rl = createInterface({ input: createReadStream(TXT, 'utf8'), crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = line.split('\t');
    const pop = parseInt(cols[14], 10);
    if (!pop) continue;
    cities.push({
      id: parseInt(cols[0], 10),
      name: cols[1],
      country: cols[8],
      admin1: cols[10],
      lat: parseFloat(cols[4]),
      lng: parseFloat(cols[5]),
      pop,
    });
  }

  mkdirSync(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(cities), 'utf8');
  console.log(`Wrote ${cities.length} cities to ${OUT}`);

  try { unlinkSync(ZIP); unlinkSync(TXT); } catch {}
}

main().catch((e) => { console.error(e); process.exit(1); });

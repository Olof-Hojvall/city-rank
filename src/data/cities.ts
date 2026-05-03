export type City = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lng: number;
  pop: number;
};

let cached: City[] | null = null;

export async function loadCities(): Promise<City[]> {
  if (cached) return cached;
  const res = await fetch(`${import.meta.env.BASE_URL}cities.json`);
  if (!res.ok) throw new Error('Failed to load cities.json');
  const data: City[] = await res.json();
  // Pre-sort by population descending once
  data.sort((a, b) => b.pop - a.pop);
  cached = data;
  return data;
}

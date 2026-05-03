import type { City } from '../data/cities';

export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

function inBounds(city: City, bounds: Bounds): boolean {
  return (
    city.lat >= bounds.south &&
    city.lat <= bounds.north &&
    city.lng >= bounds.west &&
    city.lng <= bounds.east
  );
}

export function citiesInBoundsWithRated(
  sortedCities: City[],
  bounds: Bounds,
  ratedIds: Set<number>,
  maxUnrated: number,
): { cities: City[]; isLimited: boolean } {
  const rated: City[] = [];
  const unrated: City[] = [];
  for (const city of sortedCities) {
    if (!inBounds(city, bounds)) continue;
    if (ratedIds.has(city.id)) {
      rated.push(city);
    } else {
      unrated.push(city);
    }
  }
  const isLimited = unrated.length > maxUnrated;
  return { cities: [...rated, ...unrated.slice(0, maxUnrated)], isLimited };
}

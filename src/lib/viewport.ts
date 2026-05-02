import type { City } from '../data/cities';

export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function topNCitiesInBounds(
  sortedCities: City[],
  bounds: Bounds,
  n: number,
): City[] {
  const result: City[] = [];
  for (const city of sortedCities) {
    if (result.length >= n) break;
    if (
      city.lat >= bounds.south &&
      city.lat <= bounds.north &&
      city.lng >= bounds.west &&
      city.lng <= bounds.east
    ) {
      result.push(city);
    }
  }
  return result;
}

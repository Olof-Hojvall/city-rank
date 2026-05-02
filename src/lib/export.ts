import { GRADES, type Grade } from './grades';
import type { Rankings } from './urlState';
import type { City } from '../data/cities';

type RankedCity = City & { grade: Grade };

function groupByGrade(rankings: Rankings, cities: City[]): Record<Grade, RankedCity[]> {
  const cityMap = new Map(cities.map((c) => [c.id, c]));
  const result = {} as Record<Grade, RankedCity[]>;
  for (const g of GRADES) result[g] = [];
  for (const [idStr, grade] of Object.entries(rankings)) {
    const city = cityMap.get(Number(idStr));
    if (city) result[grade].push({ ...city, grade });
  }
  return result;
}

export function exportMarkdown(rankings: Rankings, cities: City[]): string {
  const groups = groupByGrade(rankings, cities);
  return GRADES.filter((g) => groups[g].length > 0)
    .map((g) => `## ${g}\n${groups[g].map((c) => `- ${c.name}, ${c.country}`).join('\n')}`)
    .join('\n\n');
}

export function exportCSV(rankings: Rankings, cities: City[]): string {
  const header = 'grade,name,country,population,lat,lng';
  const rows: string[] = [header];
  const groups = groupByGrade(rankings, cities);
  for (const g of GRADES) {
    for (const c of groups[g]) {
      rows.push(`${g},"${c.name}",${c.country},${c.pop},${c.lat},${c.lng}`);
    }
  }
  return rows.join('\n');
}

export function exportText(rankings: Rankings, cities: City[]): string {
  const groups = groupByGrade(rankings, cities);
  return GRADES.filter((g) => groups[g].length > 0)
    .map((g) => `${g}\n${groups[g].map((c) => `  ${c.name}, ${c.country}`).join('\n')}`)
    .join('\n\n');
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

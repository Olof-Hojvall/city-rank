import { GRADES, type Grade } from './grades';
import type { Rankings } from './urlState';
import type { City } from '../data/cities';

const GRADE_SET = new Set<string>(GRADES);
function isGrade(s: string): s is Grade {
  return GRADE_SET.has(s);
}

function cityIndex(cities: City[]): Map<string, number> {
  return new Map(cities.map((c) => [c.name.toLowerCase(), c.id]));
}

export function parseCSV(text: string, cities: City[]): Rankings {
  const index = cityIndex(cities);
  const rankings: Rankings = {};
  const lines = text.trim().split('\n');
  for (const line of lines) {
    if (line.startsWith('grade,')) continue;
    const parts = line.split(',');
    if (parts.length < 2) continue;
    const grade = parts[0].trim();
    const name = parts[1].replace(/^"|"$/g, '').trim();
    if (!isGrade(grade)) continue;
    const id = index.get(name.toLowerCase());
    if (id !== undefined) rankings[id] = grade;
  }
  return rankings;
}

export function parseMarkdown(text: string, cities: City[]): Rankings {
  const index = cityIndex(cities);
  const rankings: Rankings = {};
  let currentGrade: Grade | null = null;
  for (const line of text.split('\n')) {
    const header = line.match(/^##\s+([A-F])$/);
    if (header) { currentGrade = header[1] as Grade; continue; }
    if (!currentGrade) continue;
    const item = line.match(/^-\s+(.+?),/);
    if (!item) continue;
    const id = index.get(item[1].trim().toLowerCase());
    if (id !== undefined) rankings[id] = currentGrade;
  }
  return rankings;
}

export function parseText(text: string, cities: City[]): Rankings {
  const index = cityIndex(cities);
  const rankings: Rankings = {};
  let currentGrade: Grade | null = null;
  for (const line of text.split('\n')) {
    const header = line.match(/^([A-F])$/);
    if (header) { currentGrade = header[1] as Grade; continue; }
    if (!currentGrade) continue;
    const item = line.match(/^\s{2}(.+?),/);
    if (!item) continue;
    const id = index.get(item[1].trim().toLowerCase());
    if (id !== undefined) rankings[id] = currentGrade;
  }
  return rankings;
}

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

import LZString from 'lz-string';
import type { Grade } from './grades';

export type Rankings = Record<number, Grade>;

type Envelope = { v: 1; r: Rankings };

export function encodeRankings(r: Rankings): string {
  const env: Envelope = { v: 1, r };
  return LZString.compressToEncodedURIComponent(JSON.stringify(env));
}

export function decodeRankings(s: string): Rankings {
  try {
    const raw = LZString.decompressFromEncodedURIComponent(s);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Envelope;
    return parsed.v === 1 ? parsed.r : {};
  } catch {
    return {};
  }
}

export function readHashRankings(): Rankings {
  const hash = location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const r = params.get('r');
  return r ? decodeRankings(r) : {};
}

export function writeHashRankings(rankings: Rankings): void {
  const params = new URLSearchParams(location.hash.slice(1));
  if (Object.keys(rankings).length === 0) {
    params.delete('r');
  } else {
    params.set('r', encodeRankings(rankings));
  }
  const next = params.toString();
  history.replaceState(null, '', next ? `#${next}` : location.pathname + location.search);
  try {
    localStorage.setItem('city-rank:last', next);
  } catch {}
}

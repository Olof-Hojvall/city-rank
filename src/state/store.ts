import { create } from 'zustand';
import type { Grade } from '../lib/grades';
import type { Rankings } from '../lib/urlState';
import { readHashRankings, writeHashRankings } from '../lib/urlState';
import type { City } from '../data/cities';

type Store = {
  rankings: Rankings;
  selectedCityId: number | null;
  viewportCities: City[];

  setRanking: (cityId: number, grade: Grade | null) => void;
  setSelectedCity: (cityId: number | null) => void;
  setViewportCities: (cities: City[]) => void;
  resetRankings: () => void;
  importRankings: (rankings: Rankings) => void;
  hydrateFromHash: () => void;
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleUrlUpdate(rankings: Rankings) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => writeHashRankings(rankings), 250);
}

export const useStore = create<Store>((set, get) => ({
  rankings: readHashRankings(),
  selectedCityId: null,
  viewportCities: [],

  setRanking: (cityId, grade) => {
    const rankings = { ...get().rankings };
    if (grade === null) {
      delete rankings[cityId];
    } else {
      rankings[cityId] = grade;
    }
    set({ rankings });
    scheduleUrlUpdate(rankings);
    try {
      localStorage.setItem('city-rank:last', JSON.stringify(rankings));
    } catch {}
  },

  setSelectedCity: (cityId) => set({ selectedCityId: cityId }),

  setViewportCities: (cities) => set({ viewportCities: cities }),

  resetRankings: () => {
    set({ rankings: {} });
    writeHashRankings({});
    try {
      localStorage.removeItem('city-rank:last');
    } catch {}
  },

  importRankings: (rankings) => {
    set({ rankings });
    scheduleUrlUpdate(rankings);
    try {
      localStorage.setItem('city-rank:last', JSON.stringify(rankings));
    } catch {}
  },

  hydrateFromHash: () => {
    const rankings = readHashRankings();
    set({ rankings });
  },
}));

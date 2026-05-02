export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export const GRADES: Grade[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const GRADE_COLORS: Record<Grade, string> = {
  A: '#22c55e',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444',
  F: '#dc2626',
};

export const GRADE_BG: Record<Grade, string> = {
  A: 'bg-green-500',
  B: 'bg-lime-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  E: 'bg-red-500',
  F: 'bg-red-700',
};

export const GRADE_TEXT: Record<Grade, string> = {
  A: 'text-green-600',
  B: 'text-lime-600',
  C: 'text-yellow-600',
  D: 'text-orange-600',
  E: 'text-red-600',
  F: 'text-red-800',
};

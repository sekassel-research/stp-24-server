import {SystemType} from './types';

export const SYSTEM_TYPES = {
  uninhabitable_0: {
    id: 'uninhabitable_0',
    chance: 2,
    capacity_range: [0, 0],
    district_percentage: 0,
  },
  uninhabitable_1: {
    id: 'uninhabitable_1',
    chance: 4,
    capacity_range: [10, 15],
    district_percentage: 0,
  },
  uninhabitable_2: {
    id: 'uninhabitable_2',
    chance: 4,
    capacity_range: [15, 25],
    district_percentage: 0,
  },
  uninhabitable_3: {
    id: 'uninhabitable_3',
    chance: 2,
    capacity_range: [25, 30],
    district_percentage: 0,
  },
  regular: {
    id: 'regular',
    chance: 10,
    capacity_range: [10, 25],
    district_percentage: 0.9,
  },
  energy: {
    id: 'energy',
    chance: 8,
    capacity_range: [12, 25],
    district_percentage: 1,
  },
  mining: {
    id: 'mining',
    chance: 8,
    capacity_range: [13, 28],
    district_percentage: 1,
  },
  agriculture: {
    id: 'agriculture',
    chance: 8,
    capacity_range: [15, 30],
    district_percentage: 1,
  },
  ancient_technology: {
    id: 'ancient_technology',
    chance: 1,
    capacity_range: [10, 18],
    district_percentage: 0.8,
  },
  ancient_industry: {
    id: 'ancient_industry',
    chance: 1,
    capacity_range: [10, 20],
    district_percentage: 0.8,
  },
  ancient_military: {
    id: 'ancient_military',
    chance: 1,
    capacity_range: [10, 16],
    district_percentage: 0.8,
  },
} as const satisfies Record<string, SystemType>;
export const SYSTEM_TYPE_NAMES = Object.keys(SYSTEM_TYPES) as SystemTypeName[];
export const INHABITABLE_SYSTEM_TYPES = SYSTEM_TYPE_NAMES.filter(s => !s.startsWith('uninhabitable_'));
export type SystemTypeName = keyof typeof SYSTEM_TYPES;

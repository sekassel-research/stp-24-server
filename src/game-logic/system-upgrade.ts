import {SystemUpgrade} from './types';

export const SYSTEM_UPGRADES = {
  unexplored: {
    id: 'unexplored',
    pop_growth: 1,
    cost: {},
    upkeep: {},
  },
  explored: {
    id: 'explored',
    pop_growth: 1,
    cost: {},
    upkeep: {},
  },
  colonized: {
    id: 'colonized',
    pop_growth: 1.10, // pop_growth_colonized tech tree
    cost: {
      minerals: 100, // cheap_claims tech tree
      energy: 100, // cheap_claims tech tree
    },
    upkeep: {
      energy: 1,
      fuel: 1,
      food: 1,
    },
  },
  upgraded: {
    id: 'upgraded',
    pop_growth: 1.05, // pop_growth_upgraded tech tree
    cost: {
      minerals: 100, // cheap_claims tech tree
      alloys: 100, // cheap_claims tech tree
    },
    upkeep: {
      energy: 2,
      fuel: 2,
      food: 2,
      alloys: 1, // upgraded systems provide defense that must be maintained
    },
  },
  developed: {
    id: 'developed',
    pop_growth: 1.01,
    cost: {
      alloys: 200, // TODO cheap_claims tech tree
      fuel: 100, // TODO cheap_claims tech tree
    },
    upkeep: {
      energy: 4,
      fuel: 4,
      food: 4,
      alloys: 3,
    },
  }
} as const satisfies Record<string, SystemUpgrade>;

export type SystemUpgradeName = keyof typeof SYSTEM_UPGRADES;
export const SYSTEM_UPGRADE_NAMES = Object.keys(SYSTEM_UPGRADES) as SystemUpgradeName[];

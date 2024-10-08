import type {District} from './types';

export const DISTRICTS = {
  city: {
    id: 'city',
    chance: {},
    build_time: 9, // fast_district_construction tech tree
    cost: {
      minerals: 100, // city_structure tech tree
    },
    upkeep: {
      energy: 3, // efficient_city tech tree
      consumer_goods: 4, // efficient_city tech tree
    },
    production: {
      credits: 12, // city_production tech tree
    },
  },
  // basic resource districts. cost should be around 75, upkeep around 5, production around 10
  energy: {
    id: 'energy',
    chance: {
      energy: 5,
      ancient_technology: 4, // wisdom_reclamation tech tree
      ancient_industry: 3, // primordial_industrial_secrets tech tree
      ancient_military: 3, // timeless_warfare tech tree
      default: 2,
    },
    build_time: 6, // fast_district_construction tech tree
    cost: {
      minerals: 75, // quantum_cost_reduction tech tree
    },
    upkeep: { // low_maintenance_power_grids tech tree
      minerals: 2,
    },
    production: { // energetic_terraforming tech tree
      energy: 12,
    },
  },
  mining: {
    id: 'mining',
    chance: {
      mining: 5,
      ancient_industry: 4, // primordial_industrial_secrets tech tree
      ancient_technology: 3, // wisdom_reclamation tech tree
      ancient_military: 3, // timeless_warfare tech tree
      default: 2,
    },
    build_time: 6, // fast_district_construction tech tree
    cost: {
      minerals: 50, // nano_excavator_optimization tech tree
      energy: 25, // nano_excavator_optimization tech tree
    },
    upkeep: { // autonomous_mining_protocols tech tree
      energy: 2,
    },
    production: { //improved_extraction_tech_1 tech tree
      minerals: 12,
    },
  },
  agriculture: {
    id: 'agriculture',
    chance: {
      agriculture: 5,
      default: 2,
    },
    build_time: 6, // fast_district_construction tech tree
    cost: {
      energy: 75, // permaculture_ecosystem_engineering tech tree
    },
    upkeep: {
      energy: 2, // self_replenishment tech tree
    },
    production: {
      food: 12, // superior_crops tech tree
    },
  },
  // advanced resource districts. cost should be around 100, upkeep around 20, production around 10
  industry: {
    id: 'industry',
    chance: {},
    build_time: 9, // fast_district_construction tech tree
    cost: {
      minerals: 100, // industry_structure tech tree
    },
    upkeep: {
      energy: 3, // efficient_industry tech tree
      minerals: 4, // efficient_industry tech tree
    },
    production: {
      alloys: 4, // improved_industry tech tree
      consumer_goods: 8, // improved_industry tech tree
      fuel: 6, // improved_industry tech tree
    },
  },
  research_site: {
    id: 'research_site',
    chance: {
      ancient_technology: 5, // wisdom_reclamation tech tree
      ancient_military: 2, // timeless_warfare tech tree
      ancient_industry: 2, // primordial_industrial_secrets tech tree
      default: 0,
    },
    build_time: 3, // fast_district_construction tech tree
    cost: {
      minerals: 100, // effective_lab_building tech tree
    },
    upkeep: {
      energy: 3, // automated_research_archives tech tree
      consumer_goods: 3,
    },
    production: {
      research: 15, // research_accelerators tech tree
    },
  },
  ancient_foundry: {
    id: 'ancient_foundry',
    chance: {
      ancient_military: 5, // timeless_warfare tech tree
      ancient_industry: 3, // primordial_industrial_secrets tech tree
      ancient_technology: 2, // wisdom_reclamation tech tree
      default: 0,
    },
    build_time: 9, // fast_district_construction tech tree
    cost: {
      minerals: 100, // ancient_crafting_techniques tech tree
    },
    upkeep: {
      minerals: 3, // timeless_fabrication_methods tech tree
      energy: 2, // timeless_fabrication_methods tech tree
    },
    production: {
      alloys: 8, // mythic_alloy_crafting tech tree
    },
  },
  ancient_factory: {
    id: 'ancient_factory',
    chance: {
      ancient_industry: 5,
      ancient_technology: 3,
      ancient_military: 2,
      default: 0,
    },
    build_time: 9, // fast_district_construction tech tree
    cost: {
      minerals: 100,
    },
    upkeep: {
      energy: 3,
      minerals: 2,
    },
    production: {
      consumer_goods: 12,
    },
  },
  ancient_refinery: {
    id: 'ancient_refinery',
    chance: {
      ancient_industry: 5, // primordial_industrial_secrets tech tree
      ancient_military: 3, // timeless_warfare tech tree
      ancient_technology: 2, // wisdom_reclamation tech tree
      default: 0,
    },
    build_time: 9, // fast_district_construction tech tree
    cost: {
      minerals: 100, // traditional_refining_wisdom tech tree
    },
    upkeep: {
      minerals: 3, // ageless_refining_techniques tech tree
      energy: 2, // ageless_refining_techniques tech tree
    },
    production: {
      fuel: 10, // ancient_alchemy tech tree
    },
  },
} as const satisfies Record<string, District>;
export type DistrictName = keyof typeof DISTRICTS;
export const DISTRICT_NAMES = Object.keys(DISTRICTS) as DistrictName[];

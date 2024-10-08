import {Effect, EffectSource, ExplainedVariable, Variable} from './types';
import {Empire} from '../empire/empire.schema';
import {getEffectiveTechnologies, TECH_CATEGORIES, TECHNOLOGIES} from './technologies';
import {TRAITS} from './traits';
import {BUILDINGS} from './buildings';
import {EMPIRE_VARIABLES} from './empire-variables';
import {RESOURCES} from './resources';
import {DISTRICTS} from './districts';
import {SYSTEM_UPGRADES} from './system-upgrade';
import {SHIP_TYPES} from './ships';
import {System} from '../system/system.schema';
import {notFound} from '@mean-stream/nestx';
import {Fleet} from '../fleet/fleet.schema';

export const VARIABLES = {
  districts: DISTRICTS,
  buildings: BUILDINGS,
  empire: EMPIRE_VARIABLES,
  systems: SYSTEM_UPGRADES,
  resources: RESOURCES,
  technologies: TECH_CATEGORIES,
  ships: SHIP_TYPES,
} as const;

export function getInitialVariables(): Record<Variable, number> {
  return flatten(VARIABLES);
}

export function getVariables(prefix: keyof typeof VARIABLES): Record<Variable, number> {
  return flatten(VARIABLES[prefix], prefix + '.');
}

export function flatten(obj: any, prefix = '', into: any = {}): any {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      flatten(value, prefix + key + '.', into);
    } else if (typeof value === 'number') {
      into[prefix + key] = value;
    }
  }
  return into;
}

export function getInitialValue(variable: Variable): number {
  // deep key access
  let value: any = VARIABLES;
  for (const key of variable.split('.')) {
    if (!(key in value)) {
      notFound(variable);
    }
    value = value[key];
  }
  return value;
}

export type EmpireEffectSources = Pick<Empire, 'traits' | 'technologies' | 'effects'>;

export function getEmpireEffectSources(empire: EmpireEffectSources, systemOrFleet?: System | Fleet): EffectSource[] {
  return [
    ...empire.traits.map(t => TRAITS[t]),
    ...getEffectiveTechnologies(empire.technologies.map(t => TECHNOLOGIES[t]).filter(t => t)),
    ...empire.effects ?? [],
    ...systemOrFleet?.effects ?? [],
  ];
}

export function calculateVariable(variable: Variable, empire: EmpireEffectSources, systemOrFleet?: System | Fleet): number {
  const variables = {[variable]: getInitialValue(variable)};
  calculateVariables(variables, empire, systemOrFleet);
  return variables[variable];
}

export function calculateVariables(variables: Partial<Record<Variable, number>>, empire: EmpireEffectSources, systemOrFleet?: System | Fleet) {
  const sources = getEmpireEffectSources(empire, systemOrFleet);
  applyEffects(variables, sources.flatMap(source => source.effects));
}

export function applyEffects(variables: Partial<Record<Variable, number>>, effects: readonly Effect[]) {
  // step 1: apply base
  for (const effect of effects) {
    if (effect.base !== undefined) {
      // Allow effects to create new variables (though they may not be recognized)
      variables[effect.variable] = (variables[effect.variable] ?? 0) + effect.base;
    }
  }

  // step 2: apply multiplier
  for (const effect of effects) {
    if (effect.multiplier !== undefined && variables[effect.variable] !== undefined) {
      variables[effect.variable]! *= effect.multiplier;
    }
  }

  // step 3: apply bonus
  for (const effect of effects) {
    if (effect.bonus !== undefined && variables[effect.variable] !== undefined) {
      variables[effect.variable]! += effect.bonus;
    }
  }
}

export function explainVariable(variable: Variable, allSources: EffectSource[], initial = getInitialValue(variable)): ExplainedVariable {
  const sources = allSources
    .map(source => ({id: source.id, effects: source.effects.filter(effect => effect.variable === variable)}))
    .filter(source => source.effects.length > 0);
  const mod = {[variable]: initial};
  applyEffects(mod as any, sources.flatMap(source => source.effects));
  return {variable, initial, sources, final: mod[variable]};
}

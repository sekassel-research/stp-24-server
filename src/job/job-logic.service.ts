import {BadRequestException, Injectable} from '@nestjs/common';
import {EmpireDocument} from '../empire/empire.schema';
import {RESOURCE_NAMES, ResourceName} from '../game-logic/resources';
import {CreateJobDto} from './job.dto';
import {UserDocument} from '../user/user.schema';
import {SystemDocument} from '../system/system.schema';
import {JobType} from './job-type.enum';
import {notFound} from '@mean-stream/nestx';
import {SYSTEM_UPGRADES} from '../game-logic/system-upgrade';
import {TECHNOLOGIES} from '../game-logic/technologies';
import {calculateVariables, getVariables, VARIABLES} from '../game-logic/variables';
import {TechnologyTag, Variable} from '../game-logic/types';
import {EmpireService} from '../empire/empire.service';
import {UpdateSystemDto} from '../system/system.dto';
import {UpdateEmpireDto} from '../empire/empire.dto';
import {BuildingName} from '../game-logic/buildings';
import {DistrictName} from '../game-logic/districts';
import {JobDocument} from './job.schema';
import {SystemService} from '../system/system.service';

@Injectable()
export class JobLogicService {
  constructor(
    // TODO there should be no injections, this should be pure logic
    private readonly empireService: EmpireService,
    private readonly systemService: SystemService,
  ) {
  }

  // TODO move to GameLogicService
  deductResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>): void {
    const missingResources = Object.entries(cost)
      .filter(([resource, amount]) => empire.resources[resource as ResourceName] < amount)
      .map(([resource, _]) => resource);
    if (missingResources.length) {
      throw new BadRequestException(`Not enough resources: ${missingResources.join(', ')}`);
    }
    for (const [resource, amount] of Object.entries(cost)) {
      empire.resources[resource as ResourceName] -= amount;
    }
    empire.markModified('resources');
  }

  getCost(dto: CreateJobDto, user: UserDocument, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {

    switch (dto.type as JobType) {
      case JobType.BUILDING:
        if (!system) notFound(dto.system);
        const building = dto.building;
        if (!building) {
          throw new BadRequestException('Building name is required for this job type.');
        }
        return this.getCosts('buildings', building, empire, system);

      case JobType.DISTRICT:
        const district = dto.district;
        if (!district) {
          throw new BadRequestException('District name is required for this job type.');
        }
        return this.getCosts('districts', district, empire, system);

      case JobType.UPGRADE:
        if (!system) notFound(dto.system);
        if (system.owner !== empire._id && system.upgrade !== 'unexplored') {
          throw new BadRequestException('You can only upgrade systems you own.');
        }
        const type = SYSTEM_UPGRADES[system.upgrade]?.next;
        if (!type) {
          throw new BadRequestException('System type cannot be upgraded further.');
        }
        return this.getCosts('systems', type, empire, system);

      case JobType.TECHNOLOGY:
        if (!dto.technology) {
          throw new BadRequestException('Technology ID is required for this job type.');
        }
        const technology = TECHNOLOGIES[dto.technology] ?? notFound(dto.technology);
        return {research: this.empireService.getTechnologyCost(user, empire, technology)};
    }
  }

  private getCosts(prefix: keyof typeof VARIABLES, name: string, empire: EmpireDocument, system?: SystemDocument): Partial<Record<ResourceName, number>> {
    const result: Partial<Record<ResourceName, number>> = {};
    const variables = getVariables(prefix);
    calculateVariables(variables, empire, system);
    for (const resource of RESOURCE_NAMES) { // support custom variables
      const variable = `${prefix}.${name}.cost.${resource}`;
      if (variable in variables) {
        result[resource] = variables[variable as Variable];
      }
    }
    return result;
  }

  refundResources(empire: EmpireDocument, cost: Partial<Record<ResourceName, number>>) {
    for (const [resource, amount] of Object.entries(cost) as [ResourceName, number][] ) {
      if (empire.resources[resource] !== undefined) {
        empire.resources[resource] += amount;
      } else {
        empire.resources[resource] = amount;
      }
    }
    empire.markModified('resources');
  }

  async completeJob(job: JobDocument, empire: EmpireDocument, system?: SystemDocument) {
    let updateSystemDto: UpdateSystemDto = {};
    switch (job.type as JobType) {
      case JobType.TECHNOLOGY:
        if (!job.technology) {
          return null;
        }
        const updateEmpireDto: UpdateEmpireDto = {technologies: [job.technology as TechnologyTag]};
        return await this.empireService.updateEmpire(empire, updateEmpireDto, job);

      case JobType.BUILDING:
        const existingBuildings = system?.buildings || [];
        const buildings = [...existingBuildings, job.building as BuildingName];
        updateSystemDto = {buildings};
        break;

      case JobType.DISTRICT:
        const districtUpdate = {[job.district as DistrictName]: 1};
        updateSystemDto = {districts: districtUpdate};
        break;

      case JobType.UPGRADE:
        if (!system) {
          return null;
        }
        const upgrade = SYSTEM_UPGRADES[system.upgrade]?.next;
        updateSystemDto = {upgrade};
        break;
    }
    if (system) {
      return await this.systemService.updateSystem(system, updateSystemDto, empire, job);
    }
  }
}

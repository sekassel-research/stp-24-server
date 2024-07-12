import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags, refs,
} from '@nestjs/swagger';
import {Validated} from "../util/validated.decorator";
import {Throttled} from "../util/throttled.decorator";
import {FleetService} from "./fleet.service";
import {Auth, AuthUser} from "../auth/auth.decorator";
import {NotFound, ObjectIdPipe, OptionalObjectIdPipe} from "@mean-stream/nestx";
import {Types} from "mongoose";
import {CreateFleetDto, ReadFleetDto, UpdateFleetDto} from "./fleet.dto";
import {Fleet} from "./fleet.schema";
import {EmpireService} from "../empire/empire.service";
import {User} from "../user/user.schema";
import {SystemService} from "../system/system.service";
import {EmpireDocument} from "../empire/empire.schema";

@Controller('games/:game/fleets')
@ApiTags('Fleets')
@Validated()
@Throttled()
export class FleetController {
  constructor(
    private readonly fleetService: FleetService,
    private readonly empireService: EmpireService,
    private readonly systemService: SystemService,
  ) {
  }

  @Post()
  @Auth()
  @ApiOperation({description: 'Create a new fleet.'})
  @ApiCreatedResponse({type: Fleet})
  @ApiForbiddenResponse({description: 'You don\'t have an empire in this game.'})
  @ApiConflictResponse()
  @NotFound()
  async createFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() createFleetDto: CreateFleetDto,
    @AuthUser() user: User,
  ): Promise<Fleet | null> {
    const empire = await this.checkUserAccess(game, user);
    const system = await this.systemService.find(createFleetDto.location);
    if (!system) {
      throw new NotFoundException('System not found.');
    }
    if (!system.owner?.equals(empire._id)) {
      throw new ConflictException('You can only build fleets in systems you own.');
    }
    if (!system.buildings.includes('shipyard')) {
      throw new ForbiddenException('The fleet must be built in a system with a shipyard building.');
    }
    return this.fleetService.create({...createFleetDto, game, empire: empire._id});
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get all fleets in the game, optionally filtered by the owner empire.'})
  @ApiOkResponse({type: [ReadFleetDto]})
  @ApiQuery({
    name: 'empire',
    description: 'Filter by the owning empire',
    required: false,
    type: String,
  })
  async getFleets(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Query('empire', OptionalObjectIdPipe) empire?: Types.ObjectId | undefined,
  ): Promise<ReadFleetDto[]> {
    const fleets = await this.fleetService.findAll(empire ? {game, empire} : {game}, {
      projection: {
        effects: 0,
        _private: 0
      }
    });
    return fleets.map(fleet => this.toReadFleetDto(fleet.toObject()));
  }

  @Get(':id')
  @Auth()
  @ApiOkResponse({schema: {oneOf: refs(Fleet, ReadFleetDto)}})
  @NotFound('Fleet not found.')
  async getFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | Fleet> {
    const fleet = await this.fleetService.find(id, {game});
    if (!fleet) {
      throw new NotFoundException('Fleet not found.');
    }
    const empire = await this.empireService.findOne({game, user: user._id});
    if (!empire || fleet.empire != empire._id) {
      return this.toReadFleetDto(fleet.toObject());
    }
    return fleet;
  }

  @Patch(':id')
  @Auth()
  @ApiOkResponse({type: Fleet})
  @NotFound('Fleet not found.')
  @ApiForbiddenResponse({description: 'You do not own this fleet.'})
  async updateFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() updateFleetDto: UpdateFleetDto,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | null> {
    await this.checkFleetAccess(game, id, user);
    return this.fleetService.update(id, updateFleetDto);
  }

  @Delete(':id')
  @Auth()
  @ApiOkResponse({type: Fleet})
  @NotFound('Fleet not found.')
  @ApiForbiddenResponse({description: 'You do not own this fleet.'})
  async deleteFleet(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<ReadFleetDto | null> {
    await this.checkFleetAccess(game, id, user);
    return this.fleetService.delete(id);
  }

  private async checkFleetAccess(game: Types.ObjectId, id: Types.ObjectId, user: User): Promise<Fleet> {
    const fleet = await this.fleetService.find(id, {game});
    if (!fleet) {
      throw new NotFoundException('Fleet not found.');
    }
    const empire = await this.checkUserAccess(game, user);
    if (!fleet.empire || !fleet.empire.equals(empire._id)) {
      throw new ForbiddenException('You don\'t own this fleet.');
    }
    return fleet;
  }

  private async checkUserAccess(game: Types.ObjectId, user: User): Promise<EmpireDocument> {
    const userEmpire = await this.empireService.findOne({game, user: user._id});
    if (!userEmpire) {
      throw new ForbiddenException('You don\'t have an empire in this game.');
    }
    return userEmpire;
  }

  private toReadFleetDto(fleet: Fleet): ReadFleetDto {
    const {_private, effects, ...rest} = fleet;
    return rest as ReadFleetDto;
  }
}

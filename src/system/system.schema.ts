import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, OptionalRef, Ref} from '@mean-stream/nestx';
import {DistrictName, DISTRICTS} from "../game-logic/districts";
import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsIn, IsInt, IsNumber, IsObject, IsString, Max, Min} from 'class-validator';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class System extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsString()
  type: string;

  @Prop({type: Object, default: {}})
  @IsObject()
  @ApiProperty({
    description: 'The number of slots of some district types.',
    example: {
      'energy': 5,
      'mining': 6,
      'agriculture': 5,
      'research_site': 4,
    },
    type: 'object',
    properties: Object.fromEntries(Object.keys(DISTRICTS).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
      required: false,
    }])) as any,
  })
  districtSlots: Partial<Record<DistrictName, number>>;

  @Prop({type: Object, default: {}})
  @IsObject()
  @ApiProperty({
    description: 'The number of existing districts.',
    example: {
      'energy': 2,
      'mining': 3,
      'agriculture': 1
    },
    type: 'object',
    properties: Object.fromEntries(Object.keys(DISTRICTS).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
      required: false,
    }])) as any,
  })
  districts: Partial<Record<DistrictName, number>>;

  @Prop()
  @ApiProperty({
    description: 'Total district and building capacity of the system.',
  })
  @IsInt()
  @Min(0)
  capacity: number;

  @Prop()
  @ApiProperty({
    description: 'The extra buildings built in the system.'
  })
  @IsArray()
  @IsIn(BUILDING_NAMES, {each: true})
  buildings: BuildingName[];

  @Prop()
  @ApiProperty({
    type: 'integer',
    minimum: 0,
    maximum: 2,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Max(2)
  upgrade: number;

  @Prop({type: Object})
  @ApiProperty({
    description: 'Distance to other systems that are connected to this one.',
    example: {
      '507f191e810c19729de860ea': 3,
      '617f191e810a19729de860eb': 5,
    },
    type: 'object',
  })
  links: Record<string, number>;

  @Prop()
  @ApiProperty()
  @IsNumber()
  x: number;

  @Prop()
  @ApiProperty()
  @IsNumber()
  y: number;

  @OptionalRef('Empire')
  owner?: Types.ObjectId;
}

export type SystemDocument = Doc<System>;

export const SystemSchema = SchemaFactory.createForClass(System);

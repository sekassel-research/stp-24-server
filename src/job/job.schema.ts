import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {BUILDING_NAMES, BuildingName} from '../game-logic/buildings';
import {DISTRICT_NAMES, DistrictName} from '../game-logic/districts';
import {RESOURCES_SCHEMA_PROPERTIES} from '../game-logic/types';
import {ResourceName} from '../game-logic/resources';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema, MONGO_ID_FORMAT} from '../util/schema';
import {IsEnum, IsIn, IsNumber, IsObject, IsOptional, ValidateIf} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {AsObjectId, Ref} from '@mean-stream/nestx';
import {JobType} from './job-type.enum';
import {TECHNOLOGY_IDS} from '../game-logic/technologies';
import {ErrorResponse} from '../util/error-response';
import {SHIP_NAMES} from "../game-logic/ships";

export type JobDocument = Job & Document<Types.ObjectId>;

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Job extends GlobalSchema {
  @Prop({required: true})
  @ApiProperty({description: 'Current progress of the job'})
  @IsNumber()
  progress: number;

  @Prop({required: true})
  @ApiProperty({description: 'Total progress steps required for the job'})
  @IsNumber()
  total: number;

  @Ref('Game')
  game: Types.ObjectId;

  @Ref('Empire')
  empire: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'System', required: false})
  @ApiPropertyOptional({
    description: 'System ID for the job. Required for type=building, type=district, type=upgrade.',
    ...MONGO_ID_FORMAT,
  })
  @ValidateIf((job, value) => value || job.type === JobType.BUILDING || job.type === JobType.DISTRICT || job.type === JobType.UPGRADE)
  @AsObjectId()
  system?: Types.ObjectId;

  @Prop({default: 0, index: 1})
  @ApiPropertyOptional({
    default: 0,
    description: 'Priority of the job. ' +
      'Jobs with lower values will be executed first. ' +
      'If two jobs have the same priority, the one with the earlier start time will be executed first.',
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @Prop({required: true, type: String, enum: JobType})
  @ApiProperty({enum: JobType, description: 'Type of the job'})
  @IsEnum(JobType)
  type: JobType;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: BUILDING_NAMES,
    description: 'Building name for the job. Required for type=building.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.BUILDING)
  @IsIn(BUILDING_NAMES)
  building?: BuildingName;

  @Prop({type: String})
  @ApiPropertyOptional({
    enum: DISTRICT_NAMES,
    description: 'District name for the job. Required for type=district.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.DISTRICT)
  @IsIn(DISTRICT_NAMES)
  district?: DistrictName;

  @Prop({type: String})
  @ApiPropertyOptional({
    example: 'improved_production_1',
    enum: TECHNOLOGY_IDS,
    description: 'Technology name for the job. Required for type=technology.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.TECHNOLOGY)
  @IsIn(TECHNOLOGY_IDS)
  technology?: string;

  @Prop({type: String})
  @ApiPropertyOptional({
    description: 'Fleet ID for the job. Required for type=travel and type=ship.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.TRAVEL || job.type === JobType.SHIP)
  fleet?: Types.ObjectId;

  @Prop({type: String})
  @ApiPropertyOptional({
    example: 'science',
    description: 'Ship type name for the job. Required for type=ship.',
  })
  @ValidateIf((job, value) => value || job.type === JobType.SHIP)
  @IsIn(SHIP_NAMES)
  ship?: string;

  @Prop({type: [String]})
  @ApiPropertyOptional({
    example: ['60d6f7eb8b4b8a001d6f7eb1', '60d6f7eb8b4b8a001d6f7eb2'],
    description: 'Path of system IDs for the job. First element must be the fleet\'s current system. Required for type=travel.',
  })
  path?: Types.ObjectId[];

  @Prop({type: Object, default: {}})
  @ApiPropertyOptional({
    description: 'Initial cost of resources for the job',
    ...RESOURCES_SCHEMA_PROPERTIES,
  })
  @IsOptional()
  @IsObject()
  cost?: Partial<Record<ResourceName, number>>;

  @Prop()
  @ApiPropertyOptional({
    description: 'The result of the job. If successful, the code will be 200. ' +
      'Note that the job is deleted one period after completion.',
  })
  result?: ErrorResponse;
}

export const JobSchema = SchemaFactory.createForClass(Job);

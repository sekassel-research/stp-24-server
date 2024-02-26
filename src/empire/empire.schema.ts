import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Types} from 'mongoose';
import {GLOBAL_SCHEMA_OPTIONS, GlobalSchema} from '../util/schema';
import {Doc, Ref} from '@mean-stream/nestx';
import {ApiProperty} from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {MAX_EMPIRES, MAX_TRAITS} from '../game-logic/constants';
import {ResourceName, RESOURCES} from '../game-logic/resources';
import {TRAITS} from '../game-logic/traits';
import {TECHNOLOGIES} from '../game-logic/technologies';

@Schema(GLOBAL_SCHEMA_OPTIONS)
export class Empire extends GlobalSchema {
  @Ref('Game')
  game: Types.ObjectId;

  @Ref('User')
  user: Types.ObjectId;

  @Prop()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Prop()
  @ApiProperty()
  @IsHexColor()
  color: string;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the flag this empire will use.',
    minimum: 1,
    maximum: MAX_EMPIRES,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EMPIRES)
  flag: number;

  @Prop()
  @ApiProperty({
    type: 'integer',
    description: 'ID of the portrait this empire\'s population will use.',
    minimum: 1,
    maximum: MAX_EMPIRES,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_EMPIRES)
  portrait: number;

  @Prop()
  @ApiProperty({
    description: 'Starter traits that were selected for this empire.',
    maxLength: MAX_TRAITS,
  })
  @IsArray()
  @IsString({each: true})
  @ArrayMaxSize(MAX_TRAITS)
  @IsIn(Object.keys(TRAITS), {each: true})
  traits: string[];

  @Prop({type: Object})
  @IsObject()
  @ApiProperty({
    type: 'object',
    properties: Object.fromEntries(Object.keys(RESOURCES).map(id => [id, {
      type: 'integer',
      default: 0,
      minimum: 0,
    }])) as any,
  })
  resources: Record<ResourceName, number>;

  @Prop()
  @IsArray()
  @IsIn(Object.keys(TECHNOLOGIES), {each: true})
  technologies: string[];
}

export type EmpireDocument = Doc<Empire>;

export const EmpireSchema = SchemaFactory.createForClass(Empire);

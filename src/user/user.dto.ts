import {ApiProperty, ApiPropertyOptional, OmitType, PickType} from '@nestjs/swagger';
import {Transform} from 'class-transformer';
import {IsByteLength, IsJWT, IsMongoId, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {environment} from '../environment';
import {PartialType} from '../util/partial-type';
import {User} from './user.schema';

class UserAndPassword extends OmitType(User, [
  '_id',
  'passwordHash',
  'refreshKey',
  'createdAt',
  'updatedAt',
]) {
  @IsString()
  @IsNotEmpty()
  @IsByteLength(8, undefined, {message: 'Password must be at least 8 characters'})
  @ApiProperty({minLength: 8})
  password: string;
}

export class CreateUserDto extends UserAndPassword {
}

export class UpdateUserDto extends PartialType(UserAndPassword) {
}

export class LoginDto extends PickType(UserAndPassword, ['name', 'password'] as const) {
}

export class RefreshDto {
  @ApiProperty({format: 'jwt'})
  @IsJWT()
  refreshToken: string;
}

export class LoginResult extends User {
  @ApiProperty({
    format: 'jwt',
    description: `Token for use with Bearer Authorization. Expires after ${environment.auth.expiry}.`,
  })
  accessToken: string;

  @ApiProperty({
    format: 'jwt',
    description: `Token for use with the \`POST /api/${environment.version}/auth/refresh\` endpoint. Expires after ${environment.auth.refreshExpiry}.`,
  })
  refreshToken: string;
}

export class QueryUsersDto {
  @ApiPropertyOptional({
    description: 'A comma-separated list of IDs that should be included in the response.',
  })
  @Transform(({value}) => Array.isArray(value) ? value : value?.split(','))
  @IsOptional()
  @IsMongoId({each: true})
  ids?: string[];
}

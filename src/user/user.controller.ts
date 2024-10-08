import {Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query} from '@nestjs/common';
import {ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateUserDto, QueryUsersDto, UpdateUserDto} from './user.dto';
import {User} from './user.schema';
import {UserService} from './user.service';
import {FilterQuery, Types} from 'mongoose';
import {UniqueConflict} from '../util/unique-conflict.decorator';

@Controller('users')
@ApiTags('Users')
@Validated()
@Throttled()
export class UserController {
  constructor(
    private userService: UserService,
  ) {
  }

  @Post()
  @ApiOperation({ description: 'Create a new user (sign up).' })
  @ApiCreatedResponse({ type: User })
  @UniqueConflict<User>({ name: 'Username is already taken.'})
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  @Get()
  @Auth()
  @ApiOperation({ description: 'Lists all online users.' })
  @ApiOkResponse({ type: [User] })
  async getUsers(
    @Query() { ids }: QueryUsersDto,
  ): Promise<User[]> {
    const filter: FilterQuery<User> = {};
    if (ids) {
      filter._id = { $in: ids };
    }
    return this.userService.findAll(filter, {sort: '+name'});
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ description: 'Informs about the user with the given ID.' })
  @ApiOkResponse({ type: User })
  @NotFound()
  async getUser(@Param('id', ObjectIdPipe) id: Types.ObjectId): Promise<User | null> {
    return this.userService.find(id);
  }

  @Patch(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Attempt to change someone else\'s user.' })
  @UniqueConflict<User>({ name: 'Username is already taken.'})
  async update(
    @AuthUser() user: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
    @Body() dto: UpdateUserDto,
  ): Promise<User | null> {
    if (!id.equals(user._id)) {
      throw new ForbiddenException('Cannot change someone else\'s user.');
    }
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @NotFound()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Attempt to delete someone else\'s user.' })
  async delete(
    @AuthUser() user: User,
    @Param('id', ObjectIdPipe) id: Types.ObjectId,
  ): Promise<User | null> {
    if (!id.equals(user._id)) {
      throw new ForbiddenException('Cannot delete someone else\'s user.');
    }
    return this.userService.delete(id);
  }
}

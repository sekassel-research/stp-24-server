import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';
import {Validated} from '../util/validated.decorator';
import {Throttled} from '../util/throttled.decorator';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {Friend} from './friend.schema';
import {FriendStatus, UpdateFriendDto} from './friend.dto';
import {User} from '../user/user.schema';
import {UniqueConflict} from '../util/unique-conflict.decorator';
import {FriendService} from './friend.service';

@Controller('users/:from/friends')
@ApiTags('Friends')
@Validated()
@Throttled()
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
  ) {
  }

  @Get()
  @Auth()
  @ApiOperation({description: 'Get friends list with optional status filter.'})
  @ApiOkResponse({type: [Friend]})
  @ApiForbiddenResponse({description: 'You can only access your own friends list.'})
  @ApiQuery({
    name: 'status',
    description: 'Filter friends by status (`accepted`, `requested`). ' +
      '`requested` will return both incoming and outgoing requests.',
    required: false,
    type: String,
    example: 'accepted',
  })
  async getFriends(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @AuthUser() user: User,
    @Query('status') status: string = FriendStatus.ACCEPTED,
  ): Promise<Friend[]> {
    if (!from.equals(user._id)) {
      throw new ForbiddenException('You can only access your own friends list.');
    }
    return this.friendService.getFriends(from, status as FriendStatus);
  }

  @Put(':to')
  @Auth()
  @NotFound()
  @UniqueConflict<Friend>({from_to: 'Friend request already exists.'})
  @ApiOperation({description: 'Creates a friend request by adding a Friend with from, to and status = requested.'})
  @ApiCreatedResponse({type: Friend})
  @ApiForbiddenResponse({description: 'You can only create friend requests from your own account.'})
  async createFriendRequest(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Friend> {
    if (!from.equals(user._id)) {
      throw new ForbiddenException('You can only create friend requests from your own account.');
    }
    if (from.equals(to)) {
      throw new ConflictException('You cannot send a friend request to yourself.');
    }
    const existingRequest = await this.friendService.findOne({$or: [{from, to}, {from: to, to: from}]});
    if (existingRequest) {
      throw new ConflictException('Friend request already exists.');
    }
    return this.friendService.create({from, to, status: 'requested'});
  }

  @Patch(':to')
  @Auth()
  @ApiOperation({
    description: 'Accepts a friend request. Note that the order of path parameters is swapped. ' +
      'This is done by the receiver. Also creates a second Friend object with from = to, to = from, status = \'accepted\' ' +
      '(the bidirectional inverse).'
  })
  @ApiOkResponse({type: Friend})
  @NotFound('Friend request not found.')
  async acceptFriendRequest(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @Body() dto: UpdateFriendDto,
    @AuthUser() user: User,
  ): Promise<Friend | null> {
    if (!to.equals(user._id)) {
      throw new ForbiddenException('You can only accept friend requests to your own account.');
    }
    return this.friendService.acceptFriendRequest(to, from, dto);
  }

  @Delete(':to')
  @Auth()
  @ApiOperation({
    description: 'Deletes the {from, to} Friend object and, if necessary, the {from: to, to: from} inverse object. ' +
      'If the {from, to} object is not found, the inverse object is deleted instead (aka rejecting thefriend request).'
  })
  @ApiOkResponse({type: Friend})
  @NotFound('Friend not found.')
  async deleteFriend(
    @Param('from', ObjectIdPipe) from: Types.ObjectId,
    @Param('to', ObjectIdPipe) to: Types.ObjectId,
    @AuthUser() user: User,
  ): Promise<Friend | null> {
    if (!from.equals(user._id) && !to.equals(user._id)) {
      throw new ForbiddenException('You can only delete friends from or to your own account.');
    }
    const deleted = await this.friendService.deleteOne({from, to});
    const inverse = await this.friendService.deleteOne({from: to, to: from});
    return deleted || inverse;
  }
}

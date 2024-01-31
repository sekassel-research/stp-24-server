import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {Auth, AuthUser} from '../auth/auth.decorator';
import {GameService} from '../game/game.service';
import {User} from '../user/user.schema';
import {Throttled} from '../util/throttled.decorator';
import {Validated} from '../util/validated.decorator';
import {CreateMemberDto, UpdateMemberDto} from './member.dto';
import {Member} from './member.schema';
import {MemberService} from './member.service';
import {notFound, NotFound, ObjectIdPipe} from '@mean-stream/nestx';
import {Types} from 'mongoose';

@Controller('games/:game/members')
@ApiTags('Game Members')
@Validated()
@Auth()
@Throttled()
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly gameService: GameService,
  ) {
  }

  @Post()
  @ApiOperation({description: 'Join a game with the current user.'})
  @ApiCreatedResponse({type: Member})
  @ApiNotFoundResponse({description: 'Game not found.'})
  @ApiForbiddenResponse({description: 'Incorrect password.'})
  @ApiConflictResponse({description: 'Game already started or user already joined.'})
  async create(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Body() member: CreateMemberDto,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);

    const passwordMatch = await this.memberService.checkPassword(gameDoc, member);
    if (!passwordMatch) {
      throw new ForbiddenException('Incorrect password');
    }

    if (gameDoc.started && member.empire) {
      throw new ConflictException('Game already started');
    }

    try {
      return await this.memberService.create({
        ...member,
        game,
        user: currentUser._id,
      });
    } catch (e: any) {
      if (e.code === 11000) {
        throw new ConflictException('User already joined');
      }
      throw e;
    }
  }

  @Get()
  @ApiOkResponse({type: [Member]})
  async findAll(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
  ): Promise<Member[]> {
    return this.memberService.findAll({game});
  }

  @Get(':user')
  @ApiOkResponse({type: Member})
  @NotFound()
  async findOne(
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
  ): Promise<Member | null> {
    return this.memberService.findOne({game, user});
  }

  @Patch(':user')
  @ApiOperation({description: 'Change game membership for the current user.'})
  @ApiOkResponse({type: Member})
  @ApiConflictResponse({description: 'Game already started.'})
  @ApiForbiddenResponse({description: 'Attempt to change membership of someone else.'})
  @NotFound('Game or membership not found.')
  async update(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
    @Body() dto: UpdateMemberDto,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);
    if (!currentUser._id.equals(user)) {
      throw new ForbiddenException('Cannot change membership of another user.');
    }
    if (gameDoc.started) {
      throw new ConflictException('Game already started');
    }
    return this.memberService.updateOne({game, user}, dto);
  }

  @Delete(':user')
  @ApiOperation({description: 'Leave a game with the current user.'})
  @ApiOkResponse({type: Member})
  @ApiForbiddenResponse({description: 'Attempt to kick someone else.'})
  @ApiConflictResponse({description: 'Game is already running or owner attempted to leave the game.'})
  @NotFound('Game or membership not found.')
  async delete(
    @AuthUser() currentUser: User,
    @Param('game', ObjectIdPipe) game: Types.ObjectId,
    @Param('user', ObjectIdPipe) user: Types.ObjectId,
  ): Promise<Member | null> {
    const gameDoc = await this.gameService.find(game) ?? notFound(game);
    if (!currentUser._id.equals(user)) {
      throw new ForbiddenException('Cannot kick another user.');
    }
    if (currentUser._id.equals(gameDoc.owner)) {
      throw new ConflictException('Cannot leave game as owner.');
    }
    if (gameDoc.started) {
      throw new ConflictException('Cannot leave running game.');
    }
    return this.memberService.deleteOne({game, user});
  }
}

import {Injectable} from '@nestjs/common';
import {OnEvent} from '@nestjs/event-emitter';
import {Game} from '../game/game.schema';
import {EmpireService} from './empire.service';
import {User} from '../user/user.schema';

@Injectable()
export class EmpireHandler {
  constructor(
    private empireService: EmpireService,
  ) {
  }

  @OnEvent('games.*.deleted')
  async onGameDeleted(game: Game): Promise<void> {
    await this.empireService.deleteMany({
      game: game._id,
    });
  }

  @OnEvent('users.*.deleted')
  async onUserDeleted(user: User): Promise<void> {
    await this.empireService.deleteMany({
      user: user._id,
    });
  }
}

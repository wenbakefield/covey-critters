import { Get, Patch, Route } from 'tsoa';
import Player from '../lib/Player';
import SBGame from './SBGame';

@Route('SBGame')
// eslint-disable-next-line import/prefer-default-export
export class SBGameController {
  private _game: SBGame;

  constructor(player: Player, maxScore: number, timeLimit: number) {
    this._game = new SBGame(player, maxScore, timeLimit);
  }

  @Patch('{key}')
  public updateGame(key: string): void {
    this._game.onTick(key);
  }

  @Get()
  public gameUpdated(): SBGame {
    return this._game;
  }
}
import Player from '../lib/Player';
import IGameSession from '../lib/IGameSession';
import { SBGame as SBGameModel } from '../types/CoveyTownSocket';

export default class SBGame implements IGameSession {
  private _player: Player;

  private _spaceBarCount: number;

  private _maxScore: number;

  private _timeLimit: number;

  constructor(player: Player, maxScore: number, timeLimit: number) {
    this._player = player;
    this._spaceBarCount = 0;
    this._maxScore = maxScore;
    this._timeLimit = timeLimit;

    if (!player) {
      throw new Error('Player not found');
    }
  }

  public isOver(): boolean {
    return this._spaceBarCount === this._maxScore;
  }

  public getTimeLimit(): number {
    return this._timeLimit;
  }

  public onTick(key: string): void {
    if (key === '32') {
      this._spaceBarCount += 1;
    }
  }

  public getScore(): number {
    return this._spaceBarCount;
  }

  public getPlayer(): Player {
    return this._player;
  }

  public toModel(): SBGameModel {
    return {
      playerId: this._player.id,
      score: this._spaceBarCount,
      isOver: this.isOver(),
      timeLimit: this._timeLimit,
    };
  }
}

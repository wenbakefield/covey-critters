import Player from '../lib/Player';
import IGameSession from '../lib/IGameSession';
import { GameSession } from '../types/CoveyTownSocket';

export default class SpaceBarGame implements IGameSession {
  private _player: Player;

  private _spaceBarCount: number;

  private _maxScore: number;

  private _timer: number;

  private _isOver: boolean;

  constructor(player: Player, maxScore: number, timeLimit: number) {
    this._player = player;
    this._spaceBarCount = 0;
    this._maxScore = maxScore;
    this._timer = timeLimit;
    this._isOver = false;

    if (!player) {
      throw new Error('Player not found');
    }
  }

  public isOver(): boolean {
    this._isOver = this._spaceBarCount === this._maxScore;
    return this._isOver;
  }

  public getTime(): number {
    return this._timer;
  }

  public onTick(key: string): void {
    if (key === '32') {
      // Is this needed?
      this._spaceBarCount += 1;
    }
  }

  public getScore(): number {
    return this._spaceBarCount;
  }

  public getPlayer(): Player {
    return this._player;
  }

  public toGameModel(): GameSession {
    const gameModel = {
      playerId: this.getPlayer().id,
      isOver: this.isOver(),
      score: this.getScore(),
    };
    return gameModel;
  }

  public updateFromModel(game: GameSession): void {
    this._isOver = game.isOver;
  }
}

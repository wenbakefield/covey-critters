import Player from '../lib/Player';
import IGameSession from '../lib/IGameSession';
import { GameSession as GameSessionModel } from '../types/CoveyTownSocket';

export default class SBGame implements IGameSession {
  private _player: Player;

  private _spaceBarCount: number;

  private _maxScore: number;

  private _timeLimit: number;

  private _isOver: boolean;

  constructor(player: Player, maxScore: number, timeLimit: number) {
    this._player = player;
    this._spaceBarCount = 0;
    this._maxScore = maxScore;
    this._timeLimit = timeLimit;
    this._isOver = false;

    if (!player) {
      throw new Error('Player not found');
    }
  }

  public isOver(isTimeOver = false): boolean {
    this._isOver = this._spaceBarCount >= this._maxScore || isTimeOver;
    return this._isOver;
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

  public toModel(): GameSessionModel {
    return {
      playerId: this._player.id,
      score: this._spaceBarCount,
      scoreLimit: this._maxScore,
      isOver: this._isOver,
      timeLimit: this._timeLimit,
    };
  }

  /**
   * Take in GameSessionModel and update the state of the SBGame
   * @param game represent generic game model
   */
  public updateFromModel(game: GameSessionModel): void {
    this._spaceBarCount = game.score;
    this._maxScore = game.scoreLimit;
    this._timeLimit = game.timeLimit;
    this._isOver = this.isOver(game.isOver);
  }
}

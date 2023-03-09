import { Delete, Get, Post, Route } from 'tsoa';
import SingletonScoreboardFactory from './Scoreboard';
import { Player as PlayerModel } from '../types/CoveyTownSocket';
import IScoreBoard from './IScoreBoard';

@Route('scoreboard')
export default class ScoreboardController {
  private _scoreboard: IScoreBoard;

  constructor() {
    this._scoreboard = SingletonScoreboardFactory.instance();
  }

  @Get()
  public getAllScores(): [PlayerModel, number][] {
    return this._scoreboard.getAllScores();
  }

  @Get('{topNumber}')
  public getXScores(topNumber: number): [PlayerModel, number][] {
    return this._scoreboard.getTopX(topNumber);
  }

  @Delete('{Player}')
  public removePlayer(player: PlayerModel): void {
    this._scoreboard.removePlayerScore(player);
  }

  @Post('{Player}/{score}')
  public addPlayerScore(player: PlayerModel, score: number): void {
    this._scoreboard.notifyScoreBoard(player, score);
  }

  @Get('{score}')
  public getPercentile(score: number): number {
    return this._scoreboard.calculatedPercentile(score);
  }
}

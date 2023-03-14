import { Delete, Get, Post, Route, Path } from 'tsoa';
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
  public getXScores(
    @Path()
    topNumber: number
    ): [PlayerModel, number][] {
    return this._scoreboard.getTopX(topNumber);
  }

  @Delete('{Player}')
  public removePlayer(
    @Path()
    player: PlayerModel
    ): void {
    this._scoreboard.removePlayerScore(player);
  }

  @Post('{Player}/{score}')
  public addPlayerScore(
    @Path() player: PlayerModel,
    @Path() score: number
    ): void {
    this._scoreboard.notifyScoreBoard(player, score);
  }

  @Get('{score}')
  public getPercentile(
    @Path()
    score: number
    ): number {
    return this._scoreboard.calculatedPercentile(score);
  }
}

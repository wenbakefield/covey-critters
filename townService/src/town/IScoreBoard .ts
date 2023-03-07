import { Player as PlayerModel } from '../types/CoveyTownSocket';

export default interface IScoreBoard  {
  notifyScoreBoard(player: PlayerModel, score: number): void;
  getTopX(depth: number): [PlayerModel, number][];
  getAllScores(): [PlayerModel, number][];
  calculatedPercentile(givenScore: number): number;
  removePlayerScore(player: PlayerModel): void;
}

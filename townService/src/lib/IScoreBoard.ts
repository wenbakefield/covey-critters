import { Player as PlayerModel, PlayerScoreTuple } from '../types/CoveyTownSocket';

export default interface IScoreBoard {
  notifyScoreBoard(player: PlayerModel, score: number): void;
  getTopX(depth: number): PlayerScoreTuple[];
  getAllScores(): PlayerScoreTuple[];
  calculatedPercentile(givenScore: number): number;
  removePlayerScore(player: PlayerModel): void;
}

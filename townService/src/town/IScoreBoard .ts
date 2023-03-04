import Player from '../lib/Player';

export default interface IScoreBoard  {
  notifyScoreBoard(player: Player, score: number): void;
  getTopX(depth: number): [Player, number][];
  getAllScores(): [Player, number][];
  calculatedPercentile(givenScore: number): number;
  removePlayerScore(player: Player): void;
}

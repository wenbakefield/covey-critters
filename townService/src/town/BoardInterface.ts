import Player from '../lib/Player';

export default interface BoardInterface {
  notifyScoreBoard(player: Player, score: number): void;
  getTopX(depth: number): [Player, number][];
  getAllScores(): [Player, number][];
  calculatedPercentile(givenScore: number): number;
  removePlayerScore(player: Player): void;
}

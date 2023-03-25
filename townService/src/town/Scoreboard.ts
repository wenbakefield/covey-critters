import { Player as PlayerModel, PlayerScoreTuple } from '../types/CoveyTownSocket';
import IScoreBoard from '../lib/IScoreBoard';
// uses observer and singleton Patterns
export default class Scoreboard implements IScoreBoard {
  // list of tuples that each tuple is holding Player-score pair
  private _playersAndScores: PlayerScoreTuple[] = [];

  // adds the new player score tuple to the scoreboard
  notifyScoreBoard(player: PlayerModel, score: number): void {
    const newPair: PlayerScoreTuple = { player, score };
    // if the list is empty just add it to the list
    if (this._playersAndScores.length === 0) {
      this._playersAndScores.push(newPair);
    } else {
      let ifPlaced = false;
      const copyOfScoreBoard: PlayerScoreTuple[] = [];
      // go over the scoreboard and if you can find a score that is lower than new score
      // add the new score between higher and lower scores
      for (let index = 0; index < this._playersAndScores.length; index++) {
        if (this._playersAndScores[index].score < score && !ifPlaced) {
          copyOfScoreBoard.push(newPair);
          ifPlaced = true;
        }
        copyOfScoreBoard.push(this._playersAndScores[index]);
      }
      // if it is the lowest score just place it at the end
      if (!ifPlaced) {
        copyOfScoreBoard.push(newPair);
      }
      this._playersAndScores = copyOfScoreBoard;
    }
  }

  // remove a player-score tuple. This gets called by Town.ts when a player exits the town.
  public removePlayerScore(player: PlayerModel) {
    const filteredList = this._playersAndScores.filter(tuple => tuple.player.id !== player.id);
    this._playersAndScores = filteredList;
  }

  // return all player-score pairs
  public getAllScores(): PlayerScoreTuple[] {
    const scoreBoardList: PlayerScoreTuple[] = [];
    this._playersAndScores.forEach(tuple => {
      scoreBoardList.push(tuple);
    });
    return scoreBoardList;
  }

  // return top X player-score pairs
  public getTopX(depth: number): PlayerScoreTuple[] {
    if (depth < 1) {
      return [];
    }
    if (this._playersAndScores.length < depth) {
      return this._playersAndScores;
    }
    const topXOfScoreBoard: PlayerScoreTuple[] = [];
    for (let i = 0; i < depth; i++) {
      topXOfScoreBoard.push(this._playersAndScores[i]);
    }
    return topXOfScoreBoard;
  }

  // return the calculatedPercentile
  public calculatedPercentile(givenScore: number) {
    if (this._playersAndScores.length === 0) {
      return 0;
    }
    let betterScoreCount = 0;
    this._playersAndScores.forEach(tuple => {
      if (tuple.score > givenScore) {
        betterScoreCount += 1;
      }
    });
    return betterScoreCount / this._playersAndScores.length;
  }
}

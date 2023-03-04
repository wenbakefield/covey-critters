/* eslint-disable max-classes-per-file */
import Player from '../lib/Player';
import IScoreBoard  from './IScoreBoard ';

// uses observer and singleton Patterns
class Scoreboard implements IScoreBoard  {
  // list of tuples that each tuple is holding Player-score pair
  private _usernamesAndScores: [Player, number][] = [];

  // adds the new player score tuple to the scoreboard
  notifyScoreBoard(player: Player, score: number): void {
    const newPair: [Player, number] = [player, score];
    // if the list is empty just add it to the list
    if (this._usernamesAndScores.length === 0) {
      this._usernamesAndScores.push(newPair);
    } else {
      let ifPlaced = false;
      const copyOfScoreBoard: [Player, number][] = [];
      // go over the scoreboard and if you can find a score that is lower than new score
      // add the new score between higher and lower scores
      for (let index = 0; index < this._usernamesAndScores.length; index++) {
        if (this._usernamesAndScores[index][1] < score && !ifPlaced) {
          copyOfScoreBoard.push(newPair);
          ifPlaced = true;
        }
        copyOfScoreBoard.push(this._usernamesAndScores[index]);
      }
      // if it is the lowest score just place it at the end
      if (!ifPlaced) {
        copyOfScoreBoard.push(newPair);
      }
      this._usernamesAndScores = copyOfScoreBoard;
    }
  }

  // call this in socket.on('disconnect', () => { of Town.ts!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // remove a player-score tuple. This gets called by Town.ts when a player exits the town.
  public removePlayerScore(player: Player) {
    const filteredList = this._usernamesAndScores.filter(tuple => tuple[0] !== player);
    this._usernamesAndScores = filteredList;
  }

  // return all player-score pairs
  public getAllScores(): [Player, number][] {
    const scoreBoardList: [Player, number][] = [];
    this._usernamesAndScores.forEach(tuple => {
      scoreBoardList.push(tuple);
    });
    return scoreBoardList;
  }

  // return top X player-score pairs
  public getTopX(depth: number): [Player, number][] {
    if (depth < 1) {
      return [];
    }
    if (this._usernamesAndScores.length < depth) {
      return this._usernamesAndScores;
    }
    const topXOfScoreBoard: [Player, number][] = [];
    for (let i = 0; i < depth; i++) {
      topXOfScoreBoard.push(this._usernamesAndScores[i]);
    }
    return topXOfScoreBoard;
  }

  // return the calculatedPercentile
  public calculatedPercentile(givenScore: number) {
    if (this._usernamesAndScores.length === 0) {
      return 0;
    }
    let betterScoreCount = 0;
    this._usernamesAndScores.forEach(tuple => {
      if (tuple[1] > givenScore) {
        betterScoreCount += 1;
      }
    });
    return betterScoreCount / this._usernamesAndScores.length;
  }
}

export default class SingletonScoreboardFactory {
  private static _theScoreBoard: BoardInterface | undefined;

  private constructor() {
    SingletonScoreboardFactory._theScoreBoard = undefined;
  }

  public static instance(): BoardInterface {
    if (SingletonScoreboardFactory._theScoreBoard === undefined) {
      SingletonScoreboardFactory._theScoreBoard = new Scoreboard();
    }
    return SingletonScoreboardFactory._theScoreBoard;
  }
}

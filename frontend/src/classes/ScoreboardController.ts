import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerScoreTuple } from '../types/CoveyTownSocket';

export type ScoreBoardEvents = {
  scoreboardChange: (newScoreBoard: PlayerScoreTuple[]) => void;
};

export default class ScoreboardController extends (EventEmitter as new () => TypedEmitter<ScoreBoardEvents>) {
  private _scoreboard: PlayerScoreTuple[];

  constructor(playerScoreTuple: PlayerScoreTuple[]) {
    super();
    this._scoreboard = playerScoreTuple;
  }

  get scoreboard() {
    return this._scoreboard;
  }

  set scoreboard(newScoreBoard: PlayerScoreTuple[]) {
    this._scoreboard = newScoreBoard;
    this.emit('scoreboardChange', newScoreBoard);
  }

  public getXScores(topNumber: number): PlayerScoreTuple[] {
    if (topNumber < 1) {
      return [];
    }
    if (this._scoreboard.length < topNumber) {
      return this._scoreboard;
    }
    const topXOfScoreBoard: PlayerScoreTuple[] = [];
    for (let i = 0; i < topNumber; i++) {
      topXOfScoreBoard.push(this._scoreboard[i]);
    }
    return topXOfScoreBoard;
  }

  public removePlayer(player: PlayerModel): void {
    const filteredList: PlayerScoreTuple[] = this._scoreboard.filter(
      tuple => tuple.player.id !== player.id,
    );
    this._scoreboard = filteredList;
    this.emit('scoreboardChange', filteredList);
  }

  public addPlayerScore(player: PlayerModel, score: number): void {
    const newPair: PlayerScoreTuple = { player, score };
    if (this._scoreboard.length === 0) {
      this._scoreboard.push(newPair);
      const newScoreBoard: PlayerScoreTuple[] = [newPair];
      this.emit('scoreboardChange', newScoreBoard);
    } else {
      let ifPlaced = false;
      const copyOfScoreBoard: PlayerScoreTuple[] = [];
      for (let index = 0; index < this._scoreboard.length; index++) {
        if (this._scoreboard[index].score < score && !ifPlaced) {
          copyOfScoreBoard.push(newPair);
          ifPlaced = true;
        }
        copyOfScoreBoard.push(this._scoreboard[index]);
      }
      if (!ifPlaced) {
        copyOfScoreBoard.push(newPair);
      }
      this._scoreboard = copyOfScoreBoard;
      this.emit('scoreboardChange', copyOfScoreBoard);
    }
  }

  public getPercentile(score: number): number {
    if (this._scoreboard.length === 0) {
      return 0;
    }
    let betterScoreCount = 0;
    this._scoreboard.forEach(tuple => {
      if (tuple.score > score) {
        betterScoreCount += 1;
      }
    });
    return betterScoreCount / this._scoreboard.length;
  }
}

export function useScoreBoard(area: ScoreboardController): PlayerScoreTuple[] {
  const [scoreboard, setScoreboard] = useState(area.scoreboard);
  useEffect(() => {
    area.addListener('scoreboardChange', setScoreboard);
    return () => {
      area.removeListener('scoreboardChange', setScoreboard);
    };
  }, [area]);
  return scoreboard;
}

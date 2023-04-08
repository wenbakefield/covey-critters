import EventEmitter from 'events';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import { PlayerScoreTuple } from '../types/CoveyTownSocket';

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

  public getRankByPlayer(playerId: string): number {
    const rank = this._scoreboard.findIndex(player => player.player.id === playerId);
    if (rank !== -1) {
      return rank + 1;
    } else {
      return NaN;
    }
  }

  public getHighestScoreByPlayer(playerId: string): number {
    const player = this._scoreboard.find(playerScore => playerScore.player.id === playerId);
    if (player) {
      return player.score;
    } else {
      return NaN;
    }
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
  return scoreboard.slice(0, 5);
}

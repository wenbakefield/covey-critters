import EventEmitter from 'events';
import _ from 'lodash';
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

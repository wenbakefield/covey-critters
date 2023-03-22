import EventEmitter from 'events';
import { Player as PlayerModel } from '../types/CoveyTownSocket';
import SingletonScoreboardFactory from './Scoreboard';
import IScoreBoard from '../'

export type ScoreBoardEvents = {
  scoreboardChange: (newScoreBoard: [PlayerModel, number][]) => void;
};

export default class ScoreboardController extends (EventEmitter as new () => TypedEmitter<ScoreBoardEvents>) {
  private _scoreboard: IScoreBoard;

  constructor() {
    this._scoreboard = SingletonScoreboardFactory.instance();
  }

  public getAllScores(): [PlayerModel, number][] {
    return this._scoreboard.getAllScores();
  }

  public getXScores(topNumber: number): [PlayerModel, number][] {
    return this._scoreboard.getTopX(topNumber);
  }

  public removePlayer(player: PlayerModel): void {
    this._scoreboard.removePlayerScore(player);
  }

  public addPlayerScore(player: PlayerModel, score: number): void {
    this._scoreboard.notifyScoreBoard(player, score);
  }

  public getPercentile(score: number): number {
    return this._scoreboard.calculatedPercentile(score);
  }
}

export function useScoreBoard(area: ScoreBoadController): [PlayerModel, number][] {
  const [scores, setScores] = useState(area.getAllScores());
  useEffect(() => {
    area.addListener('scoreboardChange', setScores);
    return () => {
      area.removeListener('scoreboardChange', setScores);
    };
  }, [area]);
  return scores;
}

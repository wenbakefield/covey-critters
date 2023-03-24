import EventEmitter from 'events';
import { Player as PlayerModel } from '../types/CoveyTownSocket';
import SingletonScoreboardFactory from './Scoreboard';
import { PlayerScoreTuple} from '../types/CoveyTownSocket';
import Iscore
export type ScoreBoardEvents = {
  scoreboardChange: (newScoreBoard: PlayerScoreTuple[]) => void;
};

export default class ScoreboardController extends (EventEmitter as new () => TypedEmitter<ScoreBoardEvents>) {
  private _scoreboard: ScoreBoard;

  constructor() {
    this._scoreboard = SingletonScoreboardFactory.instance();
  }

  public getAllScores(): PlayerScoreTuple[] {
    return this._scoreboard.getAllScores();
  }

  public getXScores(topNumber: number): PlayerScoreTuple[] {
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

export function useScoreBoard(area: ScoreBoadController): PlayerScoreTuple[] {
  const [scores, setScores] = useState(area.getAllScores());
  useEffect(() => {
    area.addListener('scoreboardChange', setScores);
    return () => {
      area.removeListener('scoreboardChange', setScores);
    };
  }, [area]);
  return scores;
}

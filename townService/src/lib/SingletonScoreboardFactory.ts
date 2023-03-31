import IScoreBoard from './IScoreBoard';
import Scoreboard from '../town/Scoreboard';

export default class SingletonScoreboardFactory {
  private static _theScoreBoard: IScoreBoard | undefined;

  private constructor() {
    SingletonScoreboardFactory._theScoreBoard = undefined;
  }

  public static instance(): IScoreBoard {
    if (SingletonScoreboardFactory._theScoreBoard === undefined) {
      SingletonScoreboardFactory._theScoreBoard = new Scoreboard();
    }
    return SingletonScoreboardFactory._theScoreBoard;
  }
}

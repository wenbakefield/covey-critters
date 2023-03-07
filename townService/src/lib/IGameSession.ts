import Player from './Player';
import { SBGame as SBGameModel } from '../types/CoveyTownSocket';

/**
 *  An abstract Game Session Class that will contain common characteristic of a game
 */
export default interface IGameSession {
  /**
   * Check if the GameSession is end and return true if the game is ended.
   */
  isOver(): boolean;

  /**
   * Get the time of the GameSession.
   */
  getTimeLimit(): number;

  /**
   * Progress the game to the next state
   */
  onTick(key: string): void;

  /**
   * Return the score of the game
   */
  getScore(): number;

  /**
   * Return the player of the gaming session.
   */
  getPlayer(): Player;

  /**
   * Return the game as an object
   */
  toModel(): SBGameModel;
}

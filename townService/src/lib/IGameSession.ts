import Player from './Player';

/**
 *  An abstract Game Session Class that will contain common characteristic of a game
 */
export default interface IGameSession {
  /**
   * Check if the GameSession is end and return true if the game is ended.
   */
  isOver(): boolean;

  // Feel free to modify the return types
  /**
   * Get the time of the GameSession.
   */
  getTime(): number;

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
}

import { PlayerLocation } from '../types/CoveyTownSocket';

export default interface IPet {
  /**
   *
   * @param playerLocation
   */
  nextMovement(playerLocation: PlayerLocation): [number, number];
}

import { Pet as PetModel, PlayerLocation } from '../types/CoveyTownSocket';

export default interface IPet {
  /**
   * Caluculate the next movement the pet base on the updated playerlocation
   * @param playerLocation
   */
  nextMovement(playerLocation: PlayerLocation): [number, number];

  /**
   * Return a Pet Model to client
   */
  toPetModel(): PetModel;
}

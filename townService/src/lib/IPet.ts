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

  /**
   * Retrieve current Pet Location
   */
  getPetLocation(): [number, number];

  /**
   * Given a new x an y location set the Pet Location
   * @param x represent the coordinate on x axis
   * @param y represent the coordinate on y axis
   */
  setPetLocation(x: number, y: number): void;

  /**
   * Given a new name for pet change the petName
   * @param name represent the new pet name
   */
  setPetName(name: string): void;

  /**
   * Initilize the Pet Location
   * @param playerLocation represent player coordinate
   */
  initializeLocation(playerLocation: PlayerLocation): void;
}

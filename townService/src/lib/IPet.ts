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
   * Given a Pet Model return a new Pet Class
   * @param petModel Represent the pet that will be created through client
   */
  fromPetModel(petModel: PetModel): IPet;
}

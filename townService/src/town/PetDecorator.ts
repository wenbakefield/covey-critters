import IPet from '../lib/IPet';
import { Pet, PlayerLocation } from '../types/CoveyTownSocket';

export default abstract class PetDecorator implements IPet {
  private _pet: IPet;

  constructor(pet: IPet) {
    this._pet = pet;
  }

  /**
   * Calculate the next x,y trajectories of where the Pet Is heading
   * @param playerLocation given player current location on the map
   * @returns (x,y) coordinates of the pet base on current location of pet and player.
   */
  nextMovement(playerLocation: PlayerLocation): [number, number] {
    return this._pet.nextMovement(playerLocation);
  }
}

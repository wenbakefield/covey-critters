import IPet from '../lib/IPet';
import { Pet, PlayerLocation } from '../types/CoveyTownSocket';

export default abstract class PetDecorator implements IPet {
  private _pet: IPet;

  constructor(pet: IPet) {
    this._pet = pet;
  }

  toPetModel(): Pet {
    return this._pet.toPetModel();
  }

  /**
   * Calculate the next x,y trajectories of where the Pet Is heading
   * @param playerLocation given player current location on the map
   * @returns (x,y) coordinates of the pet base on current location of pet and player.
   */
  nextMovement(playerLocation: PlayerLocation): [number, number] {
    return this._pet.nextMovement(playerLocation);
  }

  /**
   * Retrieve the pet location;
   * @returns x,y coordinate that represent the Pet
   */
  getPetLocation(): [number, number] {
    return this._pet.getPetLocation();
  }

  /**
   * Given new set of location set Pet location
   * @param x represent the coordinate along the x axis
   * @param y represent the coordinate along the y axis
   */
  setPetLocation(x: number, y: number): void {
    this._pet.setPetLocation(x, y);
  }

  /**
   * Given new name of Pet set this pet a new name
   * @param name represent the new name of the pet
   */
  setPetName(name: string): void {
    this._pet.setPetName(name);
  }

  /**
   * Initialize the pet location when the pet is instantiated
   * @param playerLocation represent the player coordinate in the town
   */
  initializeLocation(playerLocation: PlayerLocation): void {
    this._pet.initializeLocation(playerLocation);
  }
}
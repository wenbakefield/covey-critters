import PetDecorator from './PetDecorator';
import IPet from '../lib/IPet';
import { Pet, PlayerLocation } from '../types/CoveyTownSocket';

const INITIAL_X_OFFSET = 20;
const Y_OFFSET = 10;

export default class FollowPlayerMovement extends PetDecorator {
  private _traceBackFrame: number;

  private _previouseFrames: PlayerLocation[] = [];

  constructor(pet: IPet, traceBackFrame: number) {
    super(pet);
    this._traceBackFrame = traceBackFrame;
  }

  /**
   * Calculate Orbital Movement of the Pet base on the player and pet location
   * @param playerLocation represent the player location on the map
   * @returns next (x,y) coordinate where the pet is moving
   */
  public nextMovement(playerLocation: PlayerLocation): [number, number, string] {
    let relx: number;
    let rely: number;
    let rotation: string;
    if (playerLocation.rotation === 'right' || playerLocation.rotation === 'left') {
      playerLocation.y += Y_OFFSET;
    }
    this._previouseFrames.push(playerLocation);
    const fifoLocation = this._previouseFrames.shift();
    if (fifoLocation) {
      relx = fifoLocation.x;
      rely = fifoLocation.y;
      rotation = fifoLocation.rotation.toString();
      this.setPetLocation(relx, rely);
      this.setPetRotation(rotation);
    } else {
      throw new Error('Unable to track player movement');
    }
    return [relx, rely, rotation];
  }

  /**
   * Initialize the pet with the the default location
   * @param playerLocation represent player coordinate in the town
   */
  public initializeLocation(playerLocation: PlayerLocation): void {
    for (let i = 0; i < this._traceBackFrame; i++) {
      this._previouseFrames.push(playerLocation);
    }
    this.setPetLocation(playerLocation.x, playerLocation.y);
  }
}

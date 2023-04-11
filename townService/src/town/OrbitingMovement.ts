import PetDecorator from './PetDecorator';
import IPet from '../lib/IPet';
import { Pet, PlayerLocation } from '../types/CoveyTownSocket';

export default class OrbitingMovement extends PetDecorator {
  private _radius: number;

  private _orbitalSpeedDeg: number;

  constructor(pet: IPet, radius = 40, orbitalSpeedDeg = 5) {
    super(pet);
    this._radius = radius;
    this._orbitalSpeedDeg = orbitalSpeedDeg;
  }

  /**
   * Calculate Orbital Movement of the Pet base on the player and pet location
   * @param playerLocation represent the player location on the map
   * @returns next (x,y) coordinate where the pet is moving
   */
  public nextMovement(playerLocation: PlayerLocation): [number, number, string] {
    const playerX = playerLocation.x;
    const playerY = playerLocation.y;
    const [petX, petY] = this.getPetLocation();

    // Reset petX and petY relative to player (i.e setting player coord => (0,0))
    let [relx, rely] = [petX - playerX, petY - playerY];
    // eslint-disable-next-line prefer-const
    let [r, theta] = this._covertToPolarCoor(relx, rely);
    r = this._radius; // Maintain radius if the player moved
    // Always move in a clockwise direction
    theta -= this._orbitalSpeedDeg;
    if (theta < 0) {
      theta += 360;
    }
    [relx, rely] = this._covertToCartesianCoor(r, theta);
    [relx, rely] = [relx + playerX, rely + playerY];
    this.setPetLocation(relx, rely);
    this.setPetRotation(playerLocation.rotation);
    return [relx, rely, playerLocation.rotation];
  }

  private _covertToPolarCoor(x: number, y: number): [number, number] {
    const r = Math.sqrt(x ** 2 + y ** 2);
    let theta = 0;
    if (x === 0 && y === 0) {
      // Special case for (0, 0) coordinate
      theta = 0;
    } else if (x >= 0 && y >= 0) {
      // First quadrant
      theta = Math.atan(y / x) * (180 / Math.PI);
    } else if (x < 0 && y >= 0) {
      // Second quadrant
      theta = 180 - Math.atan(-y / x) * (180 / Math.PI);
    } else if (x < 0 && y < 0) {
      // Third quadrant
      theta = 180 + Math.atan(y / x) * (180 / Math.PI);
    } else if (x >= 0 && y < 0) {
      // Fourth quadrant
      theta = 360 - Math.atan(-y / x) * (180 / Math.PI);
    }
    return [r, theta];
  }

  private _covertToCartesianCoor(r: number, theta: number): [number, number] {
    const x = r * Math.cos(theta * (Math.PI / 180));
    const y = r * Math.sin(theta * (Math.PI / 180));
    return [x, y];
  }

  /**
   * Initialize the pet with the the default location
   * @param playerLocation represent player coordinate in the town
   */
  public initializeLocation(playerLocation: PlayerLocation): void {
    this.setPetLocation(playerLocation.x + this._radius, playerLocation.y);
  }
}

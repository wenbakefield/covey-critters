import PetDecorator from './PetDecorator';
import IPet from '../lib/IPet';
import { PlayerLocation } from '../types/CoveyTownSocket';

export default class OrbitingMovement extends PetDecorator {
  private _radius: number;

  private _orbitalSpeedDeg: number;

  constructor(pet: IPet, radius: number, orbitalSpeedDeg = 0.5) {
    super(pet);
    this._radius = radius;
    this._orbitalSpeedDeg = orbitalSpeedDeg;
  }

  /**
   * Calculate Orbital Movement of the Pet base on the player and pet location
   * @param playerLocation represent the player location on the map
   * @returns next (x,y) coordinate where the pet is moving
   */
  public nextMovement(playerLocation: PlayerLocation): [number, number] {
    throw Error('Not Implemented');
  }

  private _covertToPolarCoor(x: number, y: number): [number, number] {
    const r = Math.sqrt(x ** 2 + y ** 2);
    let theta = 0;
    if (x !== 0) {
      theta = Math.atan(y / x) * (180 / Math.PI);
    }
    return [r, theta];
  }

  private _covertToCartesianCoor(r: number, theta: number): [number, number] {
    const x = r * Math.cos(theta * (Math.PI / 180));
    const y = r * Math.sin(theta * (Math.PI / 180));
    return [x, y];
  }
}

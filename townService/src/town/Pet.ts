import { nanoid } from 'nanoid';
import IPet from '../lib/IPet';
import { Species, MovementType, PlayerLocation, Pet as PetModel } from '../types/CoveyTownSocket';

export default class Pet implements IPet {
  private readonly _id: string;

  private _name: string;

  private readonly _species: string;

  private _movementType: string;

  private _x?: number;

  private _y?: number;

  private _xOffset: number;

  private _yOffset: number;

  constructor(
    name: string,
    species: string,
    movementType = 'offsetPlayer',
    x_offset = -40, // default value for pet location
    y_offset = -20,
  ) {
    // May need to change to Factory in the Future to accomodate different MovementPattern
    this._id = nanoid();
    this._name = name;
    this._species = species;
    this._movementType = movementType;
    this._xOffset = x_offset;
    this._yOffset = y_offset;
  }

  get x(): number {
    return this._x === undefined ? 0 : this._x;
  }

  set x(xlocation: number) {
    this._x = xlocation;
  }

  get y(): number {
    return this._y === undefined ? 0 : this._y;
  }

  set y(ylocation: number) {
    this._y = ylocation;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    if (value.length > 0) {
      this._name = value;
    } else {
      throw new Error('New pet name cannot be blank!');
    }
  }

  get species(): string {
    return this._species;
  }

  nextMovement(playerLocation: PlayerLocation): [number, number] {
    this.x = playerLocation.x + this._xOffset;
    this.y = playerLocation.y + this._yOffset;
    return [playerLocation.x + this._xOffset, playerLocation.y + this._yOffset];
  }

  toPetModel(): PetModel {
    return {
      id: this._id,
      name: this._name,
      species: this._species,
      movementType: this._movementType,
      x: this.x,
      y: this.y,
    };
  }

  getPetLocation(): [number, number] {
    return [this.x, this.y];
  }

  setPetLocation(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  setPetName(name: string): void {
    this._name = name;
  }

  initializeLocation(playerLocation: PlayerLocation): void {
    if (this._x === undefined && this._y === undefined) {
      this.x = playerLocation.x + this._xOffset;
      this.y = playerLocation.y + this._yOffset;
    }
  }
}

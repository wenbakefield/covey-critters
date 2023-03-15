import { nanoid } from 'nanoid';
import IPet from '../lib/IPet';
import { Species, MovementType, PlayerLocation, Pet as PetModel } from '../types/CoveyTownSocket';

export default class Pet implements IPet {
  private readonly _id: string;

  private _name: string;

  private readonly _species: Species;

  private _movementType: MovementType;

  private _x: number;

  private _y: number;

  private _xOffset: number;

  private _yOffset: number;

  constructor(
    name: string,
    species: Species,
    x: number,
    y: number,
    movementType = MovementType.OffsetPlayer,
    x_offset = -40, // default value for pet location
    y_offset = -20,
  ) {
    // May need to change to Factory in the Future to accomodate different MovementPattern
    this._id = nanoid();
    this._name = name;
    this._species = species;
    this._movementType = movementType;
    this._x = x;
    this._y = y;
    this._xOffset = x_offset;
    this._yOffset = y_offset;
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
    this._x = playerLocation.x + this._xOffset;
    this._y = playerLocation.y + this._yOffset;
    return [playerLocation.x + this._xOffset, playerLocation.y + this._yOffset];
  }

  toPetModel(): PetModel {
    return {
      id: this._id,
      name: this._name,
      species: this._species,
      movementType: this._movementType,
      x: this._x,
      y: this._y,
    };
  }
}

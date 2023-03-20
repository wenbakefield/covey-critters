import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Pet as PetModel } from '../types/CoveyTownSocket';

export type PetEvents = {
  /**
   * A petMovementChange Event indicate that the pet has moved.
   * Listeners are passed the new pet location.
   * @param x represent the x coordinate in the town
   * @param y represent the y coordinate in the town
   */
  petMovementChange: (x: number, y: number) => void;

  /**
   * A petNameChange event indicate the pet name has been changed.
   * Listeners are passed the new pet name
   * @param name represent the new pet name
   */
  petNameChange: (name: string) => void;
};

export default class PetController extends (EventEmitter as new () => TypedEmitter<PetEvents>) {
  private _model: PetModel;

  constructor(petModel: PetModel) {
    super();
    this._model = petModel;
  }

  public get name() {
    if (this._model) {
      return this._model.name;
    } else {
      throw new Error('Unable to retrieve Pet Name');
    }
  }

  public set name(name: string) {
    if (this._model) {
      if (this._model.name !== name) {
        this._model.name = name;
        this.emit('petNameChange', name);
      }
    } else {
      throw new Error('Unable to set Pet Name');
    }
  }

  public get location() {
    if (this._model) {
      return { x: this._model?.x, y: this._model?.y };
    } else {
      throw new Error('Unable to retrieve pet location');
    }
  }

  public set location({ x, y }) {
    if (this._model) {
      if (this._model.x !== x || this._model.y !== y) {
        this._model.x = x;
        this._model.y = y;
        this.emit('petMovementChange', x, y);
      }
    } else {
      throw new Error('Unable to retrieve pet location');
    }
  }

  public toModel(): PetModel {
    return this._model;
  }
}

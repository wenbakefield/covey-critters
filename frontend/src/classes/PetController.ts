import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Direction, Pet, Pet as PetModel } from '../types/CoveyTownSocket';

export type PetEvents = {
  /**
   * A petMovementChange Event indicate that the pet has moved.
   * Listeners are passed the new pet location.
   * @param x represent the x coordinate in the town
   * @param y represent the y coordinate in the town
   */
  petMovementChange: (x: number, y: number) => void;

  /**
   * A petRotationChange Event indicate that the pet has rotate.
   * Listener are passed the new pet rotation.
   * @param rotation represent the pet rotation in the town.
   */
  petRotationChange: (rotation: string) => void;

  /**
   * A petNameChange event indicate the pet name has been changed.
   * Listeners are passed the new pet name
   * @param name represent the new pet name
   */
  petNameChange: (name: string) => void;
};

export type PetGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label?: Phaser.GameObjects.Text;
  // Should locationMangedByGameScene
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};

export default class PetController extends (EventEmitter as new () => TypedEmitter<PetEvents>) {
  private _model: PetModel;

  private _gameObjects?: PetGameObjects;

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
        this._updateGameComponentLocation();
        this.emit('petMovementChange', x, y);
      }
    } else {
      throw new Error('Unable to retrieve pet location');
    }
  }

  public get rotation() {
    if (this._model) {
      return this._model.rotation;
    } else {
      throw new Error('Unable to retrieve pet roation');
    }
  }

  public set rotation(rotation: string) {
    if (this._model) {
      if (this._model.rotation !== rotation) {
        this._model.rotation = rotation;
        this._updateGameComponentLocation();
        this.emit('petRotationChange', rotation);
      }
    } else {
      throw new Error('Unable to retrieve pet location');
    }
  }

  public get species() {
    return this._model.species;
  }

  public toModel(): PetModel {
    return this._model;
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this._model.x);
      sprite.setY(this._model.y);
      if (label) {
        label.setX(this._model.x - 7);
        label.setY(this._model.y - 20);
      }

      // TODO: add different pet sprites
      sprite.anims.play(`${this.species}-${this.rotation}-walk`, true);
      //sprite.anims.play(`red-snake-${this.rotation}-walk`, true);
      // What is the key for this one @Ben
    }
  }

  public removePetSprite() {
    if (this.gameObjects) {
      const { sprite, label } = this.gameObjects;
      sprite.removedFromScene();
      sprite.destroy();
      label?.removedFromScene();
      label?.destroy();
    }
  }

  static fromModel(petModel: Pet): PetController {
    return new PetController(petModel);
  }
}

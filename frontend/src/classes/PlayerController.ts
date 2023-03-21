import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Pet as PetModel, Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;

  petSprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  petLabel?: Phaser.GameObjects.Text;
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  private _pet?: PetModel;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  set pet(value: PetModel | undefined) {
    this._pet = value;
  }

  get pet(): PetModel | undefined {
    return this._pet;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location, pet: this._pet };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label, petSprite, petLabel } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      label.setX(this.location.x);
      label.setY(this.location.y - 20);

      if (this.pet !== undefined && petLabel && petSprite) {
        petSprite.setX(this.pet.x);
        petSprite.setY(this.pet.y);
        petLabel.setX(this.pet.x);
        petLabel.setY(this.pet.y + 20);
      }

      // TODO: add different pet sprites
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        if (petSprite) {
          petSprite.anims.play(`pet-${this.location.rotation}-walk`, true);
        }
      } else {
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
        if (petSprite) {
          petSprite.anims.stop();
          petSprite.setTexture('pet', `pet-${this.location.rotation}`);
        }
      }
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}

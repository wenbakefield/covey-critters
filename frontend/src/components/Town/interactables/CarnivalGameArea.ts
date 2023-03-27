import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class CarnivalGameArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  private _defaultTitle?: string;

  private _isInteracting = false;

  public get defaultTitle() {
    if (!this._defaultTitle) {
      return 'No title found';
    }
    return this._defaultTitle;
  }

  getType(): KnownInteractableTypes {
    return 'carnivalGameArea';
  }
}

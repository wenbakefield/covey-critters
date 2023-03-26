import CarnivalGameAreaController from '../../../classes/CarnivalGameAreaController';
import TownController from '../../../classes/TownController';
import Interactable, { KnownInteractableTypes } from '../Interactable';
import TownGameScene from '../TownGameScene';

export default class CarnivalGameArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  private _defaultTitle?: string;

  private _carnivalAreaController?: CarnivalGameAreaController;

  private _isInteracting = false;

  private _townController: TownController;

  constructor(scene: TownGameScene) {
    super(scene);
    this._townController = scene.coveyTownController;
    this.setTintFill();
    this.setAlpha(0.3);
    this._townController.addListener('carnivalAreasChanged', this._updateConversationAreas);
  }

  public get defaultTitle() {
    if (!this._defaultTitle) {
      return 'No title found';
    }
    return this._defaultTitle;
  }

  private get _defaultLabelText() {
    const ret = this._labelText;
    if (!ret) {
      throw new Error('Expected topic text to be defined');
    }
    return ret;
  }

  getType(): KnownInteractableTypes {
    return 'carnivalGameArea';
  }

  addedToScene(): void {
    super.addedToScene();
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      'Carnival Area',
      { color: '#000000' },
    );
    this._updateConversationAreas(this._townController.carnivalGameAreas);
  }

  private _updateConversationAreas(areas: CarnivalGameAreaController[]) {
    const area = areas.find(eachAreaInController => eachAreaInController.id === this.name);
    if (area !== this._carnivalAreaController) {
      if (area === undefined) {
        this._carnivalAreaController = undefined;
        this._defaultLabelText.text = 'Carnival Area';
      } else {
        this._carnivalAreaController = area;
        if (this.isOverlapping) {
          this._scene.moveOurPlayerTo({ interactableID: this.name });
        }
      }
    }
  }
}

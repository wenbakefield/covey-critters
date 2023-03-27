import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import IGameSession from '../lib/IGameSession';
import Player from '../lib/Player';
import {
  BoundingBox,
  Interactable,
  PetRule,
  TownEmitter,
  CarnivalGameArea as CarnivalGameAreaModel,
  Pet as PetModel,
  PlayerLocation,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import IScoreBoard from '../lib/IScoreBoard';
import SingletonScoreboardFactory from '../lib/SingletonScoreboardFactory';
import SBGame from './SBGame';
import PetFactory from '../lib/PetFactory';

export default class CarnivalGameArea extends InteractableArea {
  private _scoreboard: IScoreBoard;

  private _gameSession: IGameSession[];

  private _petRule: PetRule[];

  private _townEmiiter: TownEmitter;

  /**
   * Create a new CarnivalGameArea Object
   *
   * @param carnivalGameAreaModel Represent the CarnivalGameModel object
   * @param coordinates Represent the coordinate that locate this CarnivalGameArea
   * @param townEmitter Represent the townEmitter that this CarnivalGameArea has accessed
   */
  public constructor(
    { id, petRule }: CarnivalGameAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._scoreboard = SingletonScoreboardFactory.instance();
    this._gameSession = [];
    this._petRule = petRule;
    this._townEmiiter = townEmitter;
  }

  public get scoreBoard(): IScoreBoard {
    return this._scoreboard;
  }

  public get petRule(): PetRule[] {
    return this._petRule;
  }

  public updateModel(updatedModel: CarnivalGameAreaModel) {
    this._petRule = updatedModel.petRule;
  }

  /**
   * Retrieve Gaming Session for specify playerId
   * @param playerId Represent the player unique identifier
   * @returns gameSession represent the GameSession that player is in
   */
  public getGame(playerId: string): IGameSession {
    // Check if Player exists in occupants list
    const player = this._occupants.find(players => players.id === playerId);
    if (!player) {
      throw Error(`Player with id ${playerId} cannot be found within this CarnivalGameArea`);
    } else {
      const gameSession = this._gameSession.find(game => game.getPlayer().id === playerId);
      if (!gameSession) {
        throw Error(`Player with id ${playerId} cannot be found in GameSession`);
      } else {
        return gameSession;
      }
    }
  }

  /**
   * Add the player to the scoreboad if the gameSession has ended
   * @param playerId Represent the player unique identifier
   * @param isTimerOver true if the time of the Game is over and false if the time is not over.
   * @default isTimerOver false
   */
  public notifyScoreBoard(playerId: string, isTimeOver = false) {
    const player = this._occupants.find(players => players.id === playerId);
    if (!player) {
      throw Error(`Player with id ${playerId} cannot be found within this CarnivalGameArea`);
    } else {
      const gameSession = this.getGame(playerId);
      if (gameSession.isOver(isTimeOver)) {
        // Overide
        const score = gameSession.getScore();
        this._scoreboard.notifyScoreBoard(player.toPlayerModel(), score);
      }
    }
  }

  /**
   * Once the game has end a pet will be selected base on the rule, and player will be assigned a pet
   * @param playerId Represent the player that will get a new pet
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public assignPetToPlayer(playerId: string, petName: string): PetModel {
    const pet: PetModel = this._randomizePet(playerId);
    const player = this._occupants.find(players => players.id === playerId);
    if (!player) {
      throw Error(`Player with id ${playerId} cannot be found within this CarnivalGameArea`);
    } else if (pet) {
      // Assign Player a Pet;
      pet.name = petName;
      const ipet = PetFactory.spawnPet(pet, player.location);
      player.pet = ipet;
      return ipet.toPetModel();
    }
    throw Error('Unable to Assign Player a Pet');
  }

  /**
   * Add new Reward Condition to CarnivalGameArea, if the range overlap then it will delete the existing condition and add new condition in.
   * @param petRule represent the condition for player to receive the rewards.
   */
  public addPetRule(petRule: PetRule) {
    this._deleteExistingPetRule(petRule);
    this._petRule.push(petRule);
  }

  private _deleteExistingPetRule(petRule: PetRule) {
    this._petRule = this._petRule.filter(
      rule =>
        !(
          Math.max(petRule.percentileRangeMin, rule.percentileRangeMin) <
          Math.min(petRule.percentileRangeMax, rule.percentileRangeMax)
        ),
    );
  }

  private _randomizePet(playerid: string): PetModel {
    const playerPecentile: number = this._getPlayerPercentile(playerid) * 100;
    for (let i = 0; i < this._petRule.length; i++) {
      const petRule = this._petRule[i];
      if (
        petRule.percentileRangeMin <= playerPecentile &&
        playerPecentile < petRule.percentileRangeMax
      ) {
        const randomPet =
          petRule.petSelection[Math.floor(Math.random() * petRule.petSelection.length)];
        return randomPet;
      }
    }
    throw new Error(
      `Player id ${playerid} has scored ${playerPecentile} percentile, however no corresponding Pet is found`,
    );
  }

  private _getPlayerPercentile(playerId: string): number {
    const player = this._occupants.find(players => players.id === playerId);
    if (!player) {
      throw Error(`Player with id ${playerId} cannot be found within this CarnivalGameArea`);
    } else {
      const gameSession = this.getGame(playerId);
      if (gameSession.isOver()) {
        const score = gameSession.getScore();
        const percentile = this._scoreboard.calculatedPercentile(score);
        return percentile;
      }
      throw Error('Player has not completed the game');
    }
  }

  /**
   * OVERIDE Adds a new player to this interactable area.
   *
   * Adds the player to this area's occupants array, sets the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed.
   * Additionally create a GameSession and add the player in.
   *
   * Assumes that the player specified is a member of this town.
   *
   * @param player Player to add
   */
  public add(player: Player): void {
    this._occupants.push(player);
    player.location.interactableID = this.id;
    // Create GameSession
    this._addGame(player);
    this._townEmiiter.emit('playerMoved', player.toPlayerModel());
    this._emitAreaChanged();
  }

  /**
   * Removes a player from this interactable area.
   *
   * Removes the player from this area's occupants array, clears the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed.
   * Additionally Remove the GameSession From the CarnivalGameArea
   *
   * Assumes that the player specified is an occupant of this interactable area
   *
   * @param player Player to remove
   */
  public remove(player: Player): void {
    this._occupants = this._occupants.filter(eachPlayer => eachPlayer !== player);
    player.location.interactableID = undefined;
    // Remove GameSession From CarnivalGameArea
    this._removeGame(player);
    this._townEmiiter.emit('playerMoved', player.toPlayerModel());
    this._emitAreaChanged();
  }

  /**
   * Instantiate GameSession to be added (Can Refactor to GameFactory in the Future)
   * @param player Represent the player that will associate with the GameSession
   * @param _gameType Represent the type of Game implements IGameSession
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _addGame(player: Player, _gameType?: number) {
    const spaceBarGame = new SBGame(player, 100, 100);
    player.townEmitter.emit('gameUpdated', spaceBarGame.toModel());
    this._gameSession.push(spaceBarGame);
  }

  /**
   * Remove the Player and GameSession From this CarnivalGameArea
   * @param player Represent the player that will associate with the GameSession
   * @param _gameType Represent the type of Game implements IGameSession
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _removeGame(player: Player) {
    const removeGameSession = this._gameSession.filter(game => game.getPlayer().id !== player.id);
    this._gameSession = removeGameSession;
  }

  /**
   *
   */
  public toModel(): Interactable {
    return {
      id: this.id,
      petRule: this._petRule,
    };
  }

  /**
   * Creates a new CarnivalGameArea object that will represent a CarnivalGameArea object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this CarnivalGameArea exists
   * @param broadcastEmitter An emitter that can be used by this carnivalGameArea to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): CarnivalGameArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed Carnival Game Area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CarnivalGameArea({ id: name, petRule: [] }, rect, broadcastEmitter);
  }
}

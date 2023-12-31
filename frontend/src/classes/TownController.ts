import assert from 'assert';
import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TypedEmitter from 'typed-emitter';
import Interactable from '../components/Town/Interactable';
import ViewingArea from '../components/Town/interactables/ViewingArea';
import PosterSesssionArea from '../components/Town/interactables/PosterSessionArea';
import { LoginController } from '../contexts/LoginControllerContext';
import {
  Pet,
  PetRule,
  PlayerScoreTuple,
  TownsService,
  TownsServiceClient,
} from '../generated/client';
import useTownController from '../hooks/useTownController';
import {
  ChatMessage,
  CoveyTownSocket,
  PlayerLocation,
  TownSettingsUpdate,
  ViewingArea as ViewingAreaModel,
  PosterSessionArea as PosterSessionAreaModel,
  CarnivalGameArea as CarnivalGameAreaModel,
  GameSession,
} from '../types/CoveyTownSocket';
import {
  isConversationArea,
  isViewingArea,
  isPosterSessionArea,
  isCarnivalGameArea,
} from '../types/TypeUtils';
import ConversationAreaController from './ConversationAreaController';
import PlayerController from './PlayerController';
import ViewingAreaController from './ViewingAreaController';
import PosterSessionAreaController from './PosterSessionAreaController';
import ScoreboardController from './ScoreboardController';
import CarnivalGameAreaController from './CarnivalGameAreaController';
import PetController from './PetController';
import CarnivalGameArea from '../components/Town/interactables/CarnivalGameArea';
import SpaceBarGameController from './SBGameController';

const CALCULATE_NEARBY_PLAYERS_DELAY = 300;

export type ConnectionProperties = {
  userName: string;
  townID: string;
  loginController: LoginController;
};

/**
 * The TownController emits these events. Components may subscribe to these events
 * by calling the `addListener` method on a TownController
 */
export type TownEvents = {
  /**
   * An event that indicates that the TownController is now connected to the townService
   * @param providerVideoToken a secret token that can be used to connect to the video service
   */
  connect: (providerVideoToken: string) => void;
  /**
   * An event that indicates that the TownController has been disconnected from the townService
   */
  disconnect: () => void;
  /**
   * An event that indicates that the town settings have been updated. This event is dispatched
   * before updating the properties of this TownController; clients may find the new settings in the parameter
   */
  townSettingsUpdated: (newTownSettings: TownSettingsUpdate) => void;
  /**
   * An event that indicates that the set of players in the town has changed. This event is dispatched
   * before updating the proeprties of this TownController; clients will find the new players in the parameter
   */
  playersChanged: (newPlayers: PlayerController[]) => void;
  /**
   * An event that indicates that a player has moved. This event is dispatched after updating the player's location -
   * the new location can be found on the PlayerController.
   */
  playerMoved: (movedPlayer: PlayerController) => void;
  /**
   * An event that indicates that a player has moved. This event is dispatched after updating the pet's location -
   * the new location can be found on the PetController
   */
  petMoved: (movedPet: PetController) => void;
  /**
   * An event that indicates that a player has play the game. THis event is dispatched after updating the game state
   * the new game state can be found in the SpaceBarGameController
   */
  gameUpdated: (gameModel: GameSession) => void;
  /**
   * An event that indicates that the set of conversation areas has changed. This event is dispatched
   * when a conversation area is created, or when the set of active conversations has changed. This event is dispatched
   * after updating the town controller's record of conversation areas.
   */
  conversationAreasChanged: (currentConversationAreas: ConversationAreaController[]) => void;
  /**
   * An event that indicates that the set of viewing areas has changed. This event is emitted after updating
   * the town controller's record of viewing areas.
   */
  viewingAreasChanged: (newViewingAreas: ViewingAreaController[]) => void;
  /**
   * An event that indicates that the set of poster session areas has changed. This event is emitted after updating
   * the town controller's record of poster session areas.
   */
  posterSessionAreasChanged: (newPosterSessionAreas: PosterSessionAreaController[]) => void;
  /**
   * An even that indicates that the set of carnival game area has changed. This event is emitted after updating
   * the town controller's record of carnival game areas
   */
  carnivalAreasChanged: (newCarnivalAreas: CarnivalGameAreaController[]) => void;
  /**
   * An event that indicates that a new chat message has been received, which is the parameter passed to the listener
   */
  chatMessage: (message: ChatMessage) => void;
  /**
   * An event that indicates that the 2D game is now paused. Pausing the game should, if nothing else,
   * release all key listeners, so that text entry is possible
   */
  pause: () => void;
  /**
   * An event that indicates that the 2D game should now be unpaused (resumed).
   */
  unPause: () => void;
  /**
   * An event that indicates that the player is now interacting with a different interactable
   * @param typeName the type of interactable
   * @param obj the interactable that is being interacted with
   */
  interact: <T extends Interactable>(typeName: T['name'], obj: T) => void;
};

/**
 * The (frontend) TownController manages the communication between the frontend
 * and the backend. When a player join a town, a new TownController is created,
 * and frontend components can register to receive events (@see CoveyTownEvents).
 *
 * To access the TownController from a React component, use the
 * useTownController hook (@see useTownController). While the town controller
 * can be directly used by React components, it is generally preferable to use the various hooks
 * defined in this file (e.g. @see usePlayers, @see useConversationAreas), which will automatically
 * subscribe to updates to their respective data, triggering the React component that consumes them
 * to re-render when the underlying data changes.
 *
 */
export default class TownController extends (EventEmitter as new () => TypedEmitter<TownEvents>) {
  /** The socket connection to the townsService. Messages emitted here
   * are received by the TownController in that service.
   */
  private _socket: CoveyTownSocket;

  /**
   * The REST API client to access the townsService
   */
  private _townsService: TownsService;

  /**
   * The login controller is used by the frontend application to manage logging in to a town,
   * and is also used to log out of a town.
   */
  private _loginController: LoginController;

  /**
   * The current list of players in the town. Adding or removing players might replace the array
   * with a new one; clients should take note not to retain stale references.
   */
  private _playersInternal: PlayerController[] = [];

  /**
   * The current list of conversation areas in the twon. Adding or removing conversation areas might
   * replace the array with a new one; clients should take note not to retain stale references.
   */
  private _conversationAreasInternal: ConversationAreaController[] = [];

  /**
   * The friendly name of the current town, set only once this TownController is connected to the townsService
   */
  private _friendlyNameInternal?: string;

  /**
   * The town ID of the current town, generated by the backend townsService and used to uniquely identify this town with the
   * server and other players
   */
  private readonly _townID: string;

  /**
   * If true, then this town's friendlyName and townID are included in the public listing of active towns.
   * Changes to this variable do not influence the behavior of the server, it must be changed through the townsService API client
   */
  private _townIsPubliclyListedInternal = false;

  /**
   * The username of the player whose browser created this TownController
   */
  private readonly _userName: string;

  /**
   * The user ID of the player whose browser created this TownController. The user ID is set by the backend townsService, and
   * is only available after the service is connected.
   */
  private _userID?: string;

  /**
   * A reference to the Player object that represents the player whose browser created this TownController.
   */
  private _ourPlayer?: PlayerController;

  /**
   * A secret token that is provided by the townsService when we connect, and is needed
   * for authenticating future API calls as being from the same user who created this TownController.
   */
  private _sessionToken?: string;

  /**
   * A secret token that is provided by the townsService when we connect, and can be used to connect
   * to a third-party video conferecing service.
   */
  private _providerVideoToken?: string;

  /**
   * A flag indicating whether the current 2D game is paused, or not. Pausing the game will prevent it from updating,
   * and will also release any key bindings, allowing all keys to be used for text entry or other purposes.
   */
  private _paused = false;

  /**
   * An event emitter that broadcasts interactable-specific events
   */
  private _interactableEmitter = new EventEmitter();

  private _viewingAreas: ViewingAreaController[] = [];

  private _posterSessionAreas: PosterSessionAreaController[] = [];

  private _scoreboardController: ScoreboardController;

  private _carnivalGameAreas: CarnivalGameAreaController[] = [];

  public constructor({ userName, townID, loginController }: ConnectionProperties) {
    super();
    this._townID = townID;
    this._userName = userName;
    this._loginController = loginController;
    this._scoreboardController = new ScoreboardController([]);

    /*
        The event emitter will show a warning if more than this number of listeners are registered, as it
        may indicate a leak (listeners that should de-register not de-registering). The default is 10; we expect
        more than 10 listeners because each conversation area might be its own listener, and there are more than 10
        */
    this.setMaxListeners(30);

    const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(url);
    this._socket = io(url, { auth: { userName, townID } });
    this._townsService = new TownsServiceClient({ BASE: url }).towns;
    this.registerSocketListeners();
    // this._scoreboardController.scoreboard = []; // alternative to: this.initalizeScoreboard(); error here
  }

  public get sessionToken() {
    return this._sessionToken || '';
  }

  public get userID() {
    const id = this._userID;
    assert(id);
    return id;
  }

  public get townIsPubliclyListed() {
    return this._townIsPubliclyListedInternal;
  }

  private set _townIsPubliclyListed(newSetting: boolean) {
    this._townIsPubliclyListedInternal = newSetting;
    this.emit('townSettingsUpdated', { isPubliclyListed: newSetting });
  }

  public get providerVideoToken() {
    const token = this._providerVideoToken;
    assert(token);
    return token;
  }

  public get userName() {
    return this._userName;
  }

  public get friendlyName() {
    const friendlyName = this._friendlyNameInternal;
    assert(friendlyName);
    return friendlyName;
  }

  private set _friendlyName(newFriendlyName: string) {
    this._friendlyNameInternal = newFriendlyName;
    this.emit('townSettingsUpdated', { friendlyName: newFriendlyName });
  }

  public get paused() {
    return this._paused;
  }

  public get ourPlayer() {
    const ret = this._ourPlayer;
    assert(ret);
    return ret;
  }

  public get townID() {
    return this._townID;
  }

  public pause(): void {
    if (!this._paused) {
      this._paused = true;
      this.emit('pause');
    }
  }

  public unPause(): void {
    if (this._paused) {
      this._paused = false;
      this.emit('unPause');
    }
  }

  public get players(): PlayerController[] {
    return this._playersInternal;
  }

  private set _players(newPlayers: PlayerController[]) {
    this.emit('playersChanged', newPlayers);
    this._playersInternal = newPlayers;
  }

  public get conversationAreas() {
    return this._conversationAreasInternal;
  }

  private set _conversationAreas(newConversationAreas: ConversationAreaController[]) {
    this._conversationAreasInternal = newConversationAreas;
    this.emit('conversationAreasChanged', newConversationAreas);
  }

  public get interactableEmitter() {
    return this._interactableEmitter;
  }

  public get viewingAreas() {
    return this._viewingAreas;
  }

  public set viewingAreas(newViewingAreas: ViewingAreaController[]) {
    this._viewingAreas = newViewingAreas;
    this.emit('viewingAreasChanged', newViewingAreas);
  }

  public get posterSessionAreas() {
    return this._posterSessionAreas;
  }

  public set posterSessionAreas(newPosterSessionAreas: PosterSessionAreaController[]) {
    this._posterSessionAreas = newPosterSessionAreas;
    this.emit('posterSessionAreasChanged', newPosterSessionAreas);
  }

  public get carnivalGameAreas() {
    return this._carnivalGameAreas;
  }

  public set carnivalGameAreas(newCarnivalGameAreas: CarnivalGameAreaController[]) {
    this._carnivalGameAreas = newCarnivalGameAreas;
    this.emit('carnivalAreasChanged', newCarnivalGameAreas);
  }

  /**
   * Begin interacting with an interactable object. Emits an event to all listeners.
   * @param interactedObj
   */
  public interact<T extends Interactable>(interactedObj: T) {
    this._interactableEmitter.emit(interactedObj.getType(), interactedObj);
  }

  /**
   * End interacting with an interactable object. Emits an event to all listeners.
   * @param objectNoLongerInteracting
   */
  public interactEnd(objectNoLongerInteracting: Interactable) {
    this._interactableEmitter.emit('endInteraction', objectNoLongerInteracting);
  }

  /**
   * Registers listeners for the events that can come from the server to our socket
   */
  registerSocketListeners() {
    /**
     * On chat messages, forward the messages to listeners who subscribe to the controller's events
     */
    this._socket.on('chatMessage', message => {
      this.emit('chatMessage', message);
    });
    /**
     * On changes to town settings, update the local state and emit a townSettingsUpdated event to
     * the controller's event listeners
     */
    this._socket.on('townSettingsUpdated', update => {
      const newFriendlyName = update.friendlyName;
      if (newFriendlyName !== undefined) {
        this._friendlyName = newFriendlyName;
      }
      if (update.isPubliclyListed !== undefined) {
        this._townIsPubliclyListed = update.isPubliclyListed;
      }
    });
    /**
     * On town closing events, emit a disconnect message to the controller's event listeners, and
     * return to the login screen
     */
    this._socket.on('townClosing', () => {
      this.emit('disconnect');
      this._loginController.setTownController(null);
    });
    /**
     * When a new player joins the town, update our local state of players in the town and notify
     * the controller's event listeners that the player has moved to their starting location.
     *
     * Note that setting the players array will also emit an event that the players in the town have changed.
     */
    this._socket.on('playerJoined', newPlayer => {
      const newPlayerObj = PlayerController.fromPlayerModel(newPlayer);
      this._players = this.players.concat([newPlayerObj]);
      this.emit('playerMoved', newPlayerObj);
    });
    /**
     * When a player disconnects from the town, update local state
     *
     * Note that setting the players array will also emit an event that the players in the town have changed.
     */
    this._socket.on('playerDisconnect', disconnectedPlayer => {
      this._players = this.players.filter(eachPlayer => eachPlayer.id !== disconnectedPlayer.id);
      this.initalizeScoreboard();
    });
    /**
     * When a player moves, update local state and emit an event to the controller's event listeners
     */
    this._socket.on('playerMoved', movedPlayer => {
      const playerToUpdate = this.players.find(eachPlayer => eachPlayer.id === movedPlayer.id);
      if (playerToUpdate) {
        if (playerToUpdate === this._ourPlayer) {
          /*
           * If we are told that WE moved, we shouldn't update our x,y because it's probably lagging behind
           * real time. However: we SHOULD update our interactable ID, because its value is managed by the server
           */
          playerToUpdate.location.interactableID = movedPlayer.location.interactableID;
        } else {
          playerToUpdate.location = movedPlayer.location;
        }
        this.emit('playerMoved', playerToUpdate);
      } else {
        //TODO: It should not be possible to receive a playerMoved event for a player that is not already in the players array, right?
        const newPlayer = PlayerController.fromPlayerModel(movedPlayer);
        this._players = this.players.concat(newPlayer);
        this.emit('playerMoved', newPlayer);
      }
    });

    this._socket.on('petMoved', petMoved => {
      // TODO Update Pet Movement
      const playerToUpdate = this.players.find(eachPlayer => eachPlayer.id === petMoved.playerId);
      if (playerToUpdate) {
        if (playerToUpdate.pet && petMoved.pet && playerToUpdate.pet.id === petMoved.pet.id) {
          const x = petMoved.pet.x;
          const y = petMoved.pet.y;
          playerToUpdate.pet.location = { x, y };
          playerToUpdate.pet.rotation = petMoved.pet.rotation;
          playerToUpdate.pet.name = petMoved.pet.name;
          this.emit('petMoved', playerToUpdate.pet); // Should this be emitted
        } else {
          const newPet = PetController.fromModel(petMoved.pet);
          playerToUpdate.pet = newPet;
          this.emit('petMoved', playerToUpdate.pet);
        }
      }
    });

    /**
     * When an interactable's state changes, push that update into the relevant controller, which is assumed
     * to be either a Viewing Area, a Poster Session Area, or a Conversation Area, and which is assumed to already
     * be represented by a ViewingAreaController, PosterSessionAreaController or ConversationAreaController that this TownController has.
     *
     * If a conversation area transitions from empty to occupied (or occupied to empty), this handler will emit
     * a conversationAreasChagned event to listeners of this TownController.
     *
     * If the update changes properties of the interactable, the interactable is also expected to emit its own
     * events (@see ViewingAreaController and @see ConversationAreaController and @see PosterSessionAreaController)
     */
    this._socket.on('interactableUpdate', interactable => {
      if (isConversationArea(interactable)) {
        const relArea = this.conversationAreas.find(area => area.id == interactable.id);
        if (relArea) {
          const startsEmpty = relArea.isEmpty();
          // do the update
          relArea.topic = interactable.topic;
          relArea.occupants = this._playersByIDs(interactable.occupantsByID);
          if (startsEmpty != relArea.isEmpty()) {
            this.emit('conversationAreasChanged', this._conversationAreasInternal);
          }
        }
      } else if (isViewingArea(interactable)) {
        const relArea = this.viewingAreas.find(area => area.id == interactable.id);
        if (relArea) {
          relArea.updateFrom(interactable);
        }
      } else if (isPosterSessionArea(interactable)) {
        const relArea = this.posterSessionAreas.find(area => area.id == interactable.id);
        if (relArea) {
          relArea.updateFrom(interactable);
        }
      } else if (isCarnivalGameArea(interactable)) {
        const relArea = this.carnivalGameAreas.find(area => area.id == interactable.id);
        if (relArea) {
          relArea.updateFrom(interactable);
        }
      }
    });

    this._socket.on('gameUpdated', gameModel => {
      //TODO recieve updated GameModel from backend and emit updateGame back to backend.
      const game = this.getGameByPlayerID(gameModel.playerId);
      if (game) {
        game.updateFrom(gameModel);
      }
    });
  }

  public getGameByPlayerID(playerId: string): SpaceBarGameController | undefined {
    const carnivalArea = this._carnivalGameAreas.find(
      eachArea => eachArea.getGameSessionByID(playerId) !== undefined,
    );
    // Get The Game if exists else create the new game
    if (carnivalArea) {
      const game = carnivalArea.getGameSessionByID(playerId);
      if (game) {
        return game;
      } else {
        throw new Error('Game does not exists in Carnival Area');
      }
    }
    return undefined;
  }

  /**
   * Emit a movement event for the current player, updating the state locally and
   * also notifying the townService that our player moved.
   *
   * Note: it is the responsibility of the townService to set the 'interactableID' parameter
   * of the player's location, and any interactableID set here may be overwritten by the townService
   *
   * @param newLocation
   */
  public emitMovement(newLocation: PlayerLocation) {
    this._socket.emit('playerMovement', newLocation);
    const ourPlayer = this._ourPlayer;
    assert(ourPlayer);
    // May be add a check to see if player has a pet?
    if (ourPlayer.pet) {
      this._socket.emit('petMovement', newLocation);
      this.emit('petMoved', ourPlayer.pet);
    }
    ourPlayer.location = newLocation;
    this.emit('playerMoved', ourPlayer);
  }

  /**
   * Emit a updatedGame mevent for the current player, updating the game state in the backend.
   * @param key represent the key pressed that the player has entered
   */
  public emitGameOnTick(key: string) {
    this._socket.emit('updateGame', key);
  }

  /**
   * Get the Pet Location of the player if the player has a pet
   * @returns the location of the pet
   */
  public getPetLocation() {
    if (this._ourPlayer?.pet) {
      return this.ourPlayer.pet?.location;
    }
  }

  /**
   * Emit a chat message to the townService
   *
   * @param message
   */
  public emitChatMessage(message: ChatMessage) {
    this._socket.emit('chatMessage', message);
  }

  /**
   * Update the settings of the current town. Sends the request to update the settings to the townService,
   * and does not update the local model. If the update is successful, then the townService will inform us
   * of the updated settings. Throws an error if the request is not successful.
   *
   * @param roomUpdatePassword
   * @param updatedSettings
   */
  async updateTown(
    roomUpdatePassword: string,
    updatedSettings: { isPubliclyListed: boolean; friendlyName: string },
  ) {
    await this._townsService.updateTown(this._townID, roomUpdatePassword, updatedSettings);
  }

  /**
   * Delete the current town. Sends the request to the townService, and sends an error if the request is
   * not successful
   *
   * @param roomUpdatePassword
   */
  async deleteTown(roomUpdatePassword: string) {
    await this._townsService.deleteTown(this._townID, roomUpdatePassword);
  }

  /**
   * Create a new conversation area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new conversation area - it will be
   * updated once the townService creates the area and emits an interactableUpdate
   *
   * @param newArea
   */
  async createConversationArea(newArea: {
    topic?: string;
    id: string;
    occupantsByID: Array<string>;
  }) {
    await this._townsService.createConversationArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Create a new viewing area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new viewing area - it will be
   * updated once the townService creates the area and emits an interactableUpdate
   *
   * @param newArea
   */
  async createViewingArea(newArea: ViewingAreaModel) {
    await this._townsService.createViewingArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Create a new poster session area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new poster session area - it will be
   * updated once the townService creates the area and emits an interactableUpdate
   *
   * @param newArea
   */
  async createPosterSessionArea(newArea: PosterSessionAreaModel) {
    // TODO catch the error if the file type is invalid
    console.warn('Intermediate poster session: ' + JSON.stringify(newArea, null, 4));
    await this._townsService.createPosterSessionArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Create a new carnival game area, sending the request to the townService. Throws an error if the request
   * is not successful. Does not immediately update local state about the new carnival game area - it will be updated
   * once the townService creates the area and emits an interactableUpdate.
   *
   * @param newArea Represent the new carnivalGameArea
   */
  async createCarnivalGameArea(newArea: CarnivalGameAreaModel) {
    await this._townsService.createCarnivalGameArea(this.townID, this.sessionToken, newArea);
  }

  /**
   * Disconnect from the town, notifying the townService that we are leaving and returning
   * to the login page
   */
  public disconnect() {
    this._socket.disconnect();
    this._loginController.setTownController(null);
  }

  /**
   * Connect to the townService. Throws an error if it is unable to connect
   * @returns
   */
  public async connect() {
    /*
         The connection is only valid if we receive an 'initialize' callback, and is invalid if the disconnect
         handler is called. Wrap the return of connect in a promise that is resolved upon initialize or rejected
         upon disconnect.
         */
    return new Promise<void>((resolve, reject) => {
      this._socket.connect();
      this._socket.on('initialize', initialData => {
        this._providerVideoToken = initialData.providerVideoToken;
        this._friendlyNameInternal = initialData.friendlyName;
        this._townIsPubliclyListedInternal = initialData.isPubliclyListed;
        this._sessionToken = initialData.sessionToken;
        this._players = initialData.currentPlayers.map(eachPlayerModel =>
          PlayerController.fromPlayerModel(eachPlayerModel),
        );

        this._conversationAreas = [];
        this._viewingAreas = [];
        this._posterSessionAreas = [];
        this._carnivalGameAreas = [];
        initialData.interactables.forEach(eachInteractable => {
          if (isConversationArea(eachInteractable)) {
            this._conversationAreasInternal.push(
              ConversationAreaController.fromConversationAreaModel(
                eachInteractable,
                this._playersByIDs.bind(this),
              ),
            );
          } else if (isViewingArea(eachInteractable)) {
            this._viewingAreas.push(new ViewingAreaController(eachInteractable));
          } else if (isPosterSessionArea(eachInteractable)) {
            this._posterSessionAreas.push(new PosterSessionAreaController(eachInteractable));
          } else if (isCarnivalGameArea(eachInteractable)) {
            this.carnivalGameAreas.push(new CarnivalGameAreaController(eachInteractable));
          }
        });
        this._userID = initialData.userID;
        this._ourPlayer = this.players.find(eachPlayer => eachPlayer.id == this.userID);
        this.emit('connect', initialData.providerVideoToken);
        resolve();
      });
      this._socket.on('disconnect', () => {
        reject(new Error('Invalid town ID'));
      });
    });
  }

  /**
   * Retrieve the viewing area controller that corresponds to a viewingAreaModel, creating one if necessary
   *
   * @param viewingArea
   * @returns
   */
  public getViewingAreaController(viewingArea: ViewingArea): ViewingAreaController {
    const existingController = this._viewingAreas.find(
      eachExistingArea => eachExistingArea.id === viewingArea.name,
    );
    if (existingController) {
      return existingController;
    } else {
      const newController = new ViewingAreaController({
        elapsedTimeSec: 0,
        id: viewingArea.name,
        isPlaying: false,
        video: viewingArea.defaultVideoURL,
      });
      this._viewingAreas.push(newController);
      return newController;
    }
  }

  /**
   * Retrieve the poster session area controller that corresponds to a posterSessionAreaModel, creating one if necessary
   *
   * @param posterSessionArea
   * @returns
   */
  public getPosterSessionAreaController(
    posterSessionArea: PosterSesssionArea,
  ): PosterSessionAreaController {
    const existingController = this._posterSessionAreas.find(
      eachExistingArea => eachExistingArea.id === posterSessionArea.name,
    );
    if (existingController) {
      return existingController;
    } else {
      const newController = new PosterSessionAreaController({
        id: posterSessionArea.name,
        title: posterSessionArea.defaultTitle,
        stars: 0,
        imageContents: undefined,
      });
      this._posterSessionAreas.push(newController);
      return newController;
    }
  }

  public getCarnivalSessionAreaController(
    carnivalGameArea: CarnivalGameArea,
  ): CarnivalGameAreaController {
    const existingController = this._carnivalGameAreas.find(
      eachExistingArea => eachExistingArea.id === carnivalGameArea.name,
    );
    if (existingController) {
      return existingController;
    } else {
      const newController = new CarnivalGameAreaController({
        id: carnivalGameArea.name,
        petRule: [],
      });
      this._carnivalGameAreas.push(newController);
      return newController;
    }
  }

  /**
   * Dispatch Patch request to modify the Pet rule in Carnival Game Area
   * @param carnivalGameArea represent the carnivalGameArea that need to adjust
   * @param petRule represent the added pet rule
   * @returns petRules represent all the rewards condition for the game
   */
  public async changeCarnivalGamePetRule(
    carnivalGameArea: CarnivalGameAreaController,
    petRule: PetRule,
  ): Promise<PetRule[]> {
    const exitingController = this._carnivalGameAreas.find(
      eachExistingArea => eachExistingArea.id === carnivalGameArea.id,
    );
    if (exitingController) {
      return this._townsService.changePetRule(
        this.townID,
        carnivalGameArea.id,
        this.sessionToken,
        petRule,
      );
    } else {
      throw new Error('Unable to find Carnival Game Area in TownController');
    }
  }

  /**
   * Dispatch Patch request to intialize the game to the townService
   * @param carnivalGameArea represent the carnivalGameArea.
   * @param gameModel represent the player's game session
   */
  public async initializeGame(
    carnivalGameArea: CarnivalGameAreaController,
    gameModel: GameSession,
  ): Promise<void> {
    const exitingController = this._carnivalGameAreas.find(
      eachExistingArea => eachExistingArea.id === carnivalGameArea.id,
    );
    if (exitingController) {
      return this._townsService.initializeCarnivalGame(
        this.townID,
        carnivalGameArea.id,
        this.sessionToken,
        gameModel,
      );
    } else {
      throw new Error('Unable to find Carnival Game Area in TownController');
    }
  }

  /**
   * Dispatch a patch call to assign Player a pet in townService and retrieved the pet that got assigned
   * @param carnivalGameArea represent the carnivalGameArea that the player is in
   * @param petName represent the pet name
   */
  public async assignPetToPlayer(
    carnivalGameArea: CarnivalGameAreaController,
    petName: string,
  ): Promise<Pet | undefined> {
    const existingController = this._carnivalGameAreas.find(
      eachExistingArea => eachExistingArea.id === carnivalGameArea.id,
    );
    if (existingController) {
      return this._townsService.assignPet(
        this.townID,
        carnivalGameArea.id,
        petName,
        this.sessionToken,
      );
    }
  }

  /**
   * Dispatch a patch call to end the player game session and retrieved the updated gamesession from townservice
   * @param carnivalGameArea represent the carnival area which the player is in
   */
  public async carnivalGameTimeLimitReach(
    carnivalGameArea: CarnivalGameAreaController,
  ): Promise<GameSession> {
    const existingController = this._carnivalGameAreas.find(
      eachExistingArea => eachExistingArea.id === carnivalGameArea.id,
    );
    if (existingController) {
      return this._townsService.timeLimitReached(
        this.townID,
        carnivalGameArea.id,
        this.sessionToken,
      );
    } else {
      throw new Error(`Unable to retrieve Carnival Game Area with id ${carnivalGameArea.id}`);
    }
  }

  /**
   * Emit a viewing area update to the townService
   * @param viewingArea The Viewing Area Controller that is updated and should be emitted
   *    with the event
   */
  public emitViewingAreaUpdate(viewingArea: ViewingAreaController) {
    this._socket.emit('interactableUpdate', viewingArea.viewingAreaModel());
  }

  /**
   * Emit a poster session area update to the townService
   * @param posterSessionArea The Poster Session Area Controller that is updated and should be emitted
   *    with the event
   */
  public emitPosterSessionAreaUpdate(posterSessionArea: PosterSessionAreaController) {
    this._socket.emit('interactableUpdate', posterSessionArea.posterSessionAreaModel());
  }

  /**
   * Emit a carnival game area update to the townService
   * @param carnivalGameArea The Carnival Game Area Controller that is updated snad should be emitted with event.
   */
  public emitCarnivalGameAreaUpdate(carnivalGameArea: CarnivalGameAreaController) {
    this._socket.emit('interactableUpdate', carnivalGameArea.carnivalGameAreaModel());
  }

  /**
   * Get the image contents for a specified poster session area (specified via poster session area controller)
   * @param posterSessionArea the poster session area controller
   * @returns a promise wrapping the contents of the poster session area's image (i.e. the string)
   */
  public async getPosterSessionAreaImageContents(
    posterSessionArea: PosterSessionAreaController,
  ): Promise<string> {
    return this._townsService.getPosterAreaImageContents(
      this.townID,
      posterSessionArea.id,
      this.sessionToken,
    );
  }

  /**
   * Increment the number of stars for a specified poster session area (specified via poster session area controller)
   * @param posterSessionArea the poster session area controller
   * @returns a promise wrapping the new number of stars the poster has
   */
  public async incrementPosterSessionAreaStars(
    posterSessionArea: PosterSessionAreaController,
  ): Promise<number> {
    return this._townsService.incrementPosterAreaStars(
      this.townID,
      posterSessionArea.id,
      this.sessionToken,
    );
  }

  public async addPlayerScore(score: number): Promise<void> {
    await this._townsService.addPlayerScore(this.townID, this.sessionToken, score);
    this.initalizeScoreboard();
  }

  public async initalizeScoreboard(): Promise<void> {
    const updatePlayerScoreTuple = await this._townsService.getAllScores();
    this._scoreboardController.scoreboard = updatePlayerScoreTuple;
  }

  public get scoreboardController() {
    return this._scoreboardController;
  }

  public async getPercentile(score: number): Promise<number> {
    const percentile = await this._townsService.getPercentile(score);
    return percentile;
  }

  public async getTopXScoreboard(top: number): Promise<PlayerScoreTuple[]> {
    const list = await this._townsService.getXScores(top);
    return list;
  }

  /**
   * Determine which players are "nearby" -- that they should be included in our video call
   */
  public nearbyPlayers(): PlayerController[] {
    const isNearby = (p: PlayerController) => {
      if (p.location && this.ourPlayer.location) {
        if (this.ourPlayer.location.interactableID || p.location.interactableID) {
          return p.location.interactableID === this.ourPlayer.location.interactableID;
        }
        const dx = p.location.x - this.ourPlayer.location.x;
        const dy = p.location.y - this.ourPlayer.location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return this.players.filter(p => isNearby(p));
  }

  private _playersByIDs(playerIDs: string[]): PlayerController[] {
    return this._playersInternal.filter(eachPlayer => playerIDs.includes(eachPlayer.id));
  }
}

/**
 * A react hook to retrieve the settings for this town
 *
 * This hook will cause components that use it to re-render when the settings change.
 *
 * This hook relies on the TownControllerContext.
 * @returns an object with the properties "friendlyName" and "isPubliclyListed",
 *  representing the current settings of the current town
 */
export function useTownSettings(): { friendlyName: string; isPubliclyListed: boolean } {
  const townController = useTownController();
  const [name, setName] = useState<string>(townController.friendlyName);
  const [listed, setListed] = useState<boolean>(townController.townIsPubliclyListed);
  useEffect(() => {
    const settingsUpdater = (upt: TownSettingsUpdate) => {
      const uptname = upt.friendlyName;
      const uptlisted = upt.isPubliclyListed;
      // might only be updating one setting; dont update if undefined
      if (uptname) {
        setName(uptname);
      }
      if (uptlisted != undefined) {
        setListed(uptlisted);
      }
    };
    townController.addListener('townSettingsUpdated', settingsUpdater);
    return () => {
      townController.removeListener('townSettingsUpdated', settingsUpdater);
    };
  }, [townController]);
  return { friendlyName: name, isPubliclyListed: listed };
}

/**
 * A react hook to retrieve the active conversation areas. This hook will re-render any components
 * that use it when the set of conversation areas changes. It does *not* re-render its dependent components
 * when the state of one of those areas changes - if that is desired, @see useConversationAreaTopic and @see useConversationAreaOccupants
 *
 * This hook relies on the TownControllerContext.
 *
 * @returns the list of conversation area controllers that are currently "active"
 */
export function useActiveConversationAreas(): ConversationAreaController[] {
  const townController = useTownController();
  const [conversationAreas, setConversationAreas] = useState<ConversationAreaController[]>(
    townController.conversationAreas.filter(area => !area.isEmpty()),
  );

  useEffect(() => {
    const activeSetter = (areas: ConversationAreaController[]) => {
      setConversationAreas(areas.filter(area => !area.isEmpty()));
    };
    townController.addListener('conversationAreasChanged', activeSetter);
    return () => {
      townController.removeListener('conversationAreasChanged', activeSetter);
    };
  }, [townController, setConversationAreas]);

  return conversationAreas;
}

/**
 * A react hook to return the PlayerController's corresponding to each player in the town.
 *
 * This hook will cause components that use it to re-render when the set of players in the town changes.
 *
 * This hook will *not* trigger re-renders if a player moves.
 *
 * This hook relies on the TownControllerContext.
 *
 * @returns an array of PlayerController's, representing the current set of players in the town
 */
export function usePlayers(): PlayerController[] {
  const townController = useTownController();
  const [players, setPlayers] = useState<PlayerController[]>(townController.players);
  useEffect(() => {
    // no listener for 'playerMoved'
    townController.addListener('playersChanged', setPlayers);
    return () => {
      townController.removeListener('playersChanged', setPlayers);
    };
  }, [townController, setPlayers]);
  return players;
}

/**
 * A react hook to retrieve a viewing area controller.
 *
 * This function will throw an error if the viewing area controller does not exist.
 *
 * This hook relies on the TownControllerContext.
 *
 * @param viewingAreaID The ID of the viewing area to retrieve the controller for
 *
 * @throws Error if there is no viewing area controller matching the specifeid ID
 */
export function useViewingAreaController(viewingAreaID: string): ViewingAreaController {
  const townController = useTownController();
  const ret = townController.viewingAreas.find(eachArea => eachArea.id === viewingAreaID);
  if (!ret) {
    throw new Error(`Unable to locate viewing area id ${viewingAreaID}`);
  }
  return ret;
}

/**
 * A react hook to retrieve a poster session area controller.
 *
 * This function will throw an error if the poster session area controller does not exist.
 *
 * This hook relies on the TownControllerContext.
 *
 * @param posterSessionAreaID The ID of the viewing area to retrieve the controller for
 *
 * @throws Error if there is no poster session area controller matching the specifeid ID
 */
export function usePosterSessionAreaController(
  posterSessionAreaID: string,
): PosterSessionAreaController {
  const townController = useTownController();
  const ret = townController.posterSessionAreas.find(
    eachArea => eachArea.id === posterSessionAreaID,
  );
  if (!ret) {
    throw new Error(`Unable to locate poster session area id ${posterSessionAreaID}`);
  }
  return ret;
}

export function useCarnivalGameAreaController(
  carnivalGameAreaID: string,
): CarnivalGameAreaController {
  const townController = useTownController();
  const ret = townController.carnivalGameAreas.find(eachArea => eachArea.id === carnivalGameAreaID);
  if (!ret) {
    throw new Error(`Unable to locate carnival game area id ${carnivalGameAreaID}`);
  } else {
    return ret;
  }
}

export function useSpaceBarGameController(playerID: string): SpaceBarGameController {
  const townController = useTownController();
  const gameController = townController.getGameByPlayerID(playerID);
  if (!gameController) {
    // This should not be possible
    throw new Error('Carnival Game Area is found however cannot locate Game Controller');
  } else {
    return gameController;
  }
}

function samePlayers(a1: PlayerController[], a2: PlayerController[]) {
  if (a1.length !== a2.length) return false;
  const ids1 = a1.map(p => p.id).sort();
  const ids2 = a2.map(p => p.id).sort();
  return _.isEqual(ids1, ids2);
}

/**
 * A react hook to retrieve the interactable that is *currently* be interacted with by the player in this frontend.
 * A player is "interacting" with the Interactable if they are within it, and press the spacebar.
 *
 * This hook will cause any component that uses it to re-render when the object that the player is interacting with changes.
 *
 * This hook relies on the TownControllerContext.
 *
 * @param interactableType
 */
export function useInteractable<T extends Interactable>(
  interactableType: T['name'],
): T | undefined {
  const townController = useTownController();
  const [interactable, setInteractable] = useState<T | undefined>(undefined);
  useEffect(() => {
    const onInteract = (interactWith: T) => {
      setInteractable(interactWith);
    };
    const offInteract = () => {
      setInteractable(undefined);
    };
    townController.interactableEmitter.on(interactableType, onInteract);
    townController.interactableEmitter.on('endInteraction', offInteract);

    return () => {
      townController.interactableEmitter.off(interactableType, onInteract);
      townController.interactableEmitter.off('endInteraction', offInteract);
    };
  }, [interactableType, townController, setInteractable]);
  return interactable;
}
/**
 * A react hook to retrieve the players that should be included in the video call
 *
 * This hook will cause components that  use it to re-render when the set of players in the video call changes.
 *
 * This hook relies on the TownControllerContext.
 * @returns
 */
export function usePlayersInVideoCall(): PlayerController[] {
  const townController = useTownController();
  const [playersInCall, setPlayersInCall] = useState<PlayerController[]>([]);
  useEffect(() => {
    let lastRecalculatedNearbyPlayers = 0;
    let prevNearbyPlayers: PlayerController[] = [];
    const updatePlayersInCall = () => {
      const now = Date.now();
      // To reduce re-renders, only recalculate the nearby players every so often
      if (now - lastRecalculatedNearbyPlayers > CALCULATE_NEARBY_PLAYERS_DELAY) {
        lastRecalculatedNearbyPlayers = now;
        const nearbyPlayers = townController.nearbyPlayers();
        if (!samePlayers(nearbyPlayers, prevNearbyPlayers)) {
          prevNearbyPlayers = nearbyPlayers;
          setPlayersInCall(nearbyPlayers);
        }
      }
    };
    townController.addListener('playerMoved', updatePlayersInCall);
    townController.addListener('playersChanged', updatePlayersInCall);
    updatePlayersInCall();
    return () => {
      townController.removeListener('playerMoved', updatePlayersInCall);
      townController.removeListener('playersChanged', updatePlayersInCall);
    };
  }, [townController, setPlayersInCall]);
  return playersInCall;
}

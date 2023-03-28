import assert from 'assert';
import {
  Body,
  Controller,
  Delete,
  Example,
  Get,
  Header,
  Patch,
  Path,
  Post,
  Response,
  Route,
  Tags,
} from 'tsoa';

import { Town, TownCreateParams, TownCreateResponse } from '../api/Model';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
import {
  ConversationArea,
  CoveyTownSocket,
  TownSettingsUpdate,
  ViewingArea,
  PosterSessionArea,
  Player,
  PlayerScoreTuple,
  CarnivalGameArea,
  GameSession,
  Pet,
  PetRule,
} from '../types/CoveyTownSocket';
import CarnivalGameAreaReal from './CarnivalGameArea';
import PosterSessionAreaReal from './PosterSessionArea';
import SingletonScoreboardFactory from '../lib/SingletonScoreboardFactory';
import IScoreBoard from '../lib/IScoreBoard';
import { isPosterSessionArea, isCarnivalGameArea } from '../TestUtils';

/**
 * This is the town route
 */
@Route('towns')
@Tags('towns')
// TSOA (which we use to generate the REST API from this file) does not support default exports, so the controller can't be a default export.
// eslint-disable-next-line import/prefer-default-export
export class TownsController extends Controller {
  private _townsStore: CoveyTownsStore = CoveyTownsStore.getInstance();

  private _scoreboard: IScoreBoard = SingletonScoreboardFactory.instance();

  /**
   * List all towns that are set to be publicly available
   *
   * @returns list of towns
   */
  @Get()
  public async listTowns(): Promise<Town[]> {
    return this._townsStore.getTowns();
  }

  /**
   * Create a new town
   *
   * @param request The public-facing information for the new town
   * @example request {"friendlyName": "My testing town public name", "isPubliclyListed": true}
   * @returns The ID of the newly created town, and a secret password that will be needed to update or delete this town.
   */
  @Example<TownCreateResponse>({ townID: 'stringID', townUpdatePassword: 'secretPassword' })
  @Post()
  public async createTown(@Body() request: TownCreateParams): Promise<TownCreateResponse> {
    const { townID, townUpdatePassword } = await this._townsStore.createTown(
      request.friendlyName,
      request.isPubliclyListed,
      request.mapFile,
    );
    return {
      townID,
      townUpdatePassword,
    };
  }

  /**
   * Updates an existing town's settings by ID
   *
   * @param townID  town to update
   * @param townUpdatePassword  town update password, must match the password returned by createTown
   * @param requestBody The updated settings
   */
  @Patch('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async updateTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
    @Body() requestBody: TownSettingsUpdate,
  ): Promise<void> {
    const success = this._townsStore.updateTown(
      townID,
      townUpdatePassword,
      requestBody.friendlyName,
      requestBody.isPubliclyListed,
    );
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Deletes a town
   * @param townID ID of the town to delete
   * @param townUpdatePassword town update password, must match the password returned by createTown
   */
  @Delete('{townID}')
  @Response<InvalidParametersError>(400, 'Invalid password or update values specified')
  public async deleteTown(
    @Path() townID: string,
    @Header('X-CoveyTown-Password') townUpdatePassword: string,
  ): Promise<void> {
    const success = this._townsStore.deleteTown(townID, townUpdatePassword);
    if (!success) {
      throw new InvalidParametersError('Invalid password or update values specified');
    }
  }

  /**
   * Creates a conversation area in a given town
   * @param townID ID of the town in which to create the new conversation area
   * @param sessionToken session token of the player making the request, must match the session token returned when the player joined the town
   * @param requestBody The new conversation area to create
   */
  @Post('{townID}/conversationArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createConversationArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ConversationArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addConversationArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a viewing area in a given town
   *
   * @param townID ID of the town in which to create the new viewing area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new viewing area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          viewing area could not be created
   */
  @Post('{townID}/viewingArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createViewingArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: ViewingArea,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    if (!town?.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid values specified');
    }
    const success = town.addViewingArea(requestBody);
    if (!success) {
      throw new InvalidParametersError('Invalid values specified');
    }
  }

  /**
   * Creates a poster session area in a given town
   *
   * @param townID ID of the town in which to create the new poster session area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new poster session area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session area could not be created
   */
  @Post('{townID}/posterSessionArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createPosterSessionArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: PosterSessionArea,
  ): Promise<void> {
    // download file here TODO
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    // add viewing area to the town, throw error if it fails
    if (!curTown.addPosterSessionArea(requestBody)) {
      throw new InvalidParametersError('Invalid poster session area');
    }
  }

  /**
   * Gets the image contents of a given poster session area in a given town
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist
   */
  @Patch('{townID}/{posterSessionId}/imageContents')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getPosterAreaImageContents(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<string | undefined> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    return posterSessionArea.imageContents;
  }

  /**
   * Increment the stars of a given poster session area in a given town, as long as there is
   * a poster image. Returns the new number of stars.
   *
   * @param townID ID of the town in which to get the poster session area image contents
   * @param posterSessionId interactable ID of the poster session
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session specified does not exist, or if the poster session specified
   *          does not have an image
   */
  @Patch('{townID}/{posterSessionId}/incStars')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async incrementPosterAreaStars(
    @Path() townID: string,
    @Path() posterSessionId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<number> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const posterSessionArea = curTown.getInteractable(posterSessionId);
    if (!posterSessionArea || !isPosterSessionArea(posterSessionArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    if (!posterSessionArea.imageContents) {
      throw new InvalidParametersError('Cant star a poster with no image');
    }
    const newStars = posterSessionArea.stars + 1;
    const updatedPosterSessionArea = {
      id: posterSessionArea.id,
      imageContents: posterSessionArea.imageContents,
      title: posterSessionArea.title,
      stars: newStars, // increment stars
    };
    (<PosterSessionAreaReal>posterSessionArea).updateModel(updatedPosterSessionArea);
    return newStars;
  }

  /**
   * Creates a carnival game area in a given town
   *
   * @param townID ID of the town in which to create the new poster session area
   * @param sessionToken session token of the player making the request, must
   *        match the session token returned when the player joined the town
   * @param requestBody The new carnival game area to create
   *
   * @throws InvalidParametersError if the session token is not valid, or if the
   *          poster session area could not be created
   */
  @Post('{townID}/createCarnivalArea')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async createCarnivalGameArea(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
    @Body() requestBody: CarnivalGameArea,
  ): Promise<void> {
    // download file here TODO
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    if (!curTown.getPlayerBySessionToken(sessionToken)) {
      throw new InvalidParametersError('Invalid session ID');
    }
    // add viewing area to the town, throw error if it fails
    if (!curTown.addCarnivalGameArea(requestBody)) {
      throw new InvalidParametersError('Invalid carnival game area');
    }
  }

  /**
   * Tells the backend when the game session has reached the time limit so that it will send the score to the scoreboard
   * @param requestBody The new viewing area to create
   */
  @Patch('{townID}/CarnivalGameArea/{carnivalAreaId}/timeLimitReach/{playerId}')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async timeLimitReached(
    @Path() townID: string,
    @Path() carnivalAreaId: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<GameSession> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid town ID');
    }
    const player = town.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const carnivalArea = town.getInteractable(carnivalAreaId);
    if (!carnivalArea || !isCarnivalGameArea(carnivalArea)) {
      throw new InvalidParametersError('Invali carnival area ID');
    }
    const game = (<CarnivalGameAreaReal>carnivalArea).getGame(player.id);
    const updateGame = {
      playerId: player.id,
      score: game.getScore(),
      scoreLimit: game.getScoreLimit(),
      isOver: true,
      timeLimit: game.getTimeLimit(),
    };
    game.updateFromModel(updateGame);
    return updateGame;
  }

  @Patch('{townID}/CarnivalGameArea/{carnivalAreaId}/changePetRule')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async changePetRule(
    @Path() townID: string,
    @Path() carnivalAreaId: string,
    @Body() requestBody: PetRule,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<PetRule[]> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid Town ID');
    }
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid Player Session Token');
    }
    const carnivalArea = curTown.getInteractable(carnivalAreaId);
    if (!carnivalArea || !isCarnivalGameArea(carnivalArea)) {
      throw new InvalidParametersError('Invalid Carnival Game Area');
    }
    (<CarnivalGameAreaReal>carnivalArea).addPetRule(requestBody);
    return (<CarnivalGameAreaReal>carnivalArea).petRule;
  }

  @Patch('{townID}/CarnivalGameArea/{carnivalAreaId}/initializeGame')
  @Response<InvalidParametersError>(400, 'Invalid Value Specified')
  public async initializeCarnivalGame(
    @Path() townID: string,
    @Path() carnivalAreaId: string,
    @Body() gameModel: GameSession,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<void> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid Town ID');
    }
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid Player Session Token');
    }
    const carnivalArea = curTown.getInteractable(carnivalAreaId);
    if (!carnivalArea || !isCarnivalGameArea(carnivalArea)) {
      throw new InvalidParametersError('Invalid Carnival Game Area');
    }
    const game = (<CarnivalGameAreaReal>carnivalArea).getGame(player.id);
    game.updateFromModel(gameModel);
  }

  @Get('{townID}/Pet/')
  @Response<InvalidParametersError>(400, 'Invalid values specified')
  public async getPetFromPlayerId(
    @Path() townID: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<Pet | undefined> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid town values specified');
    } else {
      const player = town.getPlayerBySessionToken(sessionToken);
      if (!player) {
        throw new InvalidParametersError('Invalid Player SessionToken specified');
      } else if (player.pet) {
        return player.pet.toPetModel();
      } else {
        return undefined;
      }
    }
  }

  @Patch('{townID}/Pet/rename/{name}')
  @Response<InvalidParametersError>(400, 'Invalid town values')
  public async renamePet(
    @Path() townID: string,
    @Path() name: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid town values specified');
    } else {
      const player = town.getPlayerBySessionToken(sessionToken);
      if (!player) {
        throw new InvalidParametersError('Invalid Player SessionToken specified');
      } else if (player.pet) {
        player.pet.setPetName(name);
      }
    }
  }

  @Get('{townID}/Scoreboard')
  public async getAllScores(@Path() townID: string): Promise<PlayerScoreTuple[]> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    return this._scoreboard.getAllScores();
  }

  @Get('{townID}/Scoreboard/{topNumber}')
  public async getXScores(
    @Path() townID: string,
    @Path() topNumber: number,
  ): Promise<PlayerScoreTuple[]> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    return this._scoreboard.getTopX(topNumber);
  }

  @Delete('{townID}/Scoreboard/{Player}')
  public async removePlayer(@Path() townID: string, @Body() player: Player): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    this._scoreboard.removePlayerScore(player);
  }

  @Post('{townID}/Scoreboard/{Player}/{score}')
  public async addPlayerScore(
    @Path() townID: string,
    @Body() player: Player,
    @Path() score: number,
  ): Promise<void> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    this._scoreboard.notifyScoreBoard(player, score);
  }

  @Get('{townID}/Scoreboard/percentile/{score}')
  public async getPercentile(@Path() townID: string, @Path() score: number): Promise<number> {
    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      throw new InvalidParametersError('Invalid values specified');
    }
    return this._scoreboard.calculatedPercentile(score);
  }

  @Patch('{townID}/CarnivalArea/{carnivalAreaId}/assignPet/{name}')
  @Response<InvalidParametersError>(400, 'Invalid town values')
  public async assignPet(
    @Path() townID: string,
    @Path() carnivalAreaId: string,
    @Path() name: string,
    @Header('X-Session-Token') sessionToken: string,
  ): Promise<Pet | undefined> {
    const curTown = this._townsStore.getTownByID(townID);
    if (!curTown) {
      throw new InvalidParametersError('Invalid town ID');
    }
    const player = curTown.getPlayerBySessionToken(sessionToken);
    if (!player) {
      throw new InvalidParametersError('Invalid session ID');
    }
    const carnivalGameArea = curTown.getInteractable(carnivalAreaId);
    if (!carnivalGameArea || !isCarnivalGameArea(carnivalGameArea)) {
      throw new InvalidParametersError('Invalid poster session ID');
    }
    if (isCarnivalGameArea(carnivalGameArea)) {
      const pet = (<CarnivalGameAreaReal>carnivalGameArea).assignPetToPlayer(player.id, name);
      return pet;
    }
    return undefined;
  }

  /**
   * Connects a client's socket to the requested town, or disconnects the socket if no such town exists
   *
   * @param socket A new socket connection, with the userName and townID parameters of the socket's
   * auth object configured with the desired townID to join and username to use
   *
   */
  public async joinTown(socket: CoveyTownSocket) {
    // Parse the client's requested username from the connection
    const { userName, townID } = socket.handshake.auth as { userName: string; townID: string };

    const town = this._townsStore.getTownByID(townID);
    if (!town) {
      socket.disconnect(true);
      return;
    }

    // Connect the client to the socket.io broadcast room for this town
    socket.join(town.townID);

    const newPlayer = await town.addPlayer(userName, socket);
    assert(newPlayer.videoToken);
    socket.emit('initialize', {
      userID: newPlayer.id,
      sessionToken: newPlayer.sessionToken,
      providerVideoToken: newPlayer.videoToken,
      currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
      friendlyName: town.friendlyName,
      isPubliclyListed: town.isPubliclyListed,
      interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
    });
  }
}

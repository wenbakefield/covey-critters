import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import { DeepMockProxy, mockClear, mockDeep, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import {
  ClientEventTypes,
  expectArraysToContainSameMembers,
  getEventListener,
  getLastEmittedEvent,
  MockedPlayer,
  mockPlayer,
} from '../TestUtils';
import {
  CarnivalGameArea as CarnivalGameAreaModel,
  ChatMessage,
  GameSession,
  Interactable,
  MovementType,
  Pet,
  PlayerLocation,
  Species,
  TownEmitter,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import CarnivalGameArea from './CarnivalGameArea';
import ConversationArea from './ConversationArea';
import SingletonScoreboardFactory from '../lib/SingletonScoreboardFactory';
import Town from './Town';

const mockTwilioVideo = mockDeep<TwilioVideo>();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);

type TestMapDict = {
  [key in string]: ITiledMap;
};
const testingMaps: TestMapDict = {
  twoConv: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  overlapping: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 40,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  noObjects: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [],
  },
  duplicateNames: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ViewingArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoPosters: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'PosterSessionArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'PosterSessionArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvOneViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
          {
            type: 'CarnivalGameArea',
            height: 237,
            id: 55,
            name: 'Name5',
            properties: [
              {
                name: 'carnivalArea',
                type: 'string',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 600,
            y: 1200,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvOnePoster: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'PosterSessionArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'imageContents',
                type: 'string',
                value: 'placeholder file contents',
              },
              {
                name: 'title',
                type: 'string',
                value: 'test title',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvTwoViewing: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 55,
            name: 'Name4',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 600,
            y: 1200,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
  twoConvTwoViewingOneCarn: {
    tiledversion: '1.9.0',
    tileheight: 32,
    tilesets: [],
    tilewidth: 32,
    type: 'map',
    layers: [
      {
        id: 4,
        name: 'Objects',
        objects: [
          {
            type: 'ConversationArea',
            height: 237,
            id: 39,
            name: 'Name1',
            rotation: 0,
            visible: true,
            width: 326,
            x: 40,
            y: 120,
          },
          {
            type: 'ConversationArea',
            height: 266,
            id: 43,
            name: 'Name2',
            rotation: 0,
            visible: true,
            width: 467,
            x: 612,
            y: 120,
          },
          {
            type: 'ViewingArea',
            height: 237,
            id: 54,
            name: 'Name3',
            properties: [
              {
                name: 'video',
                type: 'string',
                value: 'someURL',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 155,
            y: 566,
          },
          {
            type: 'CarnivalGameArea',
            height: 237,
            id: 55,
            name: 'Name5',
            properties: [
              {
                name: 'carnivalArea',
                type: 'string',
              },
            ],
            rotation: 0,
            visible: true,
            width: 326,
            x: 600,
            y: 1200,
          },
        ],
        opacity: 1,
        type: 'objectgroup',
        visible: true,
        x: 0,
        y: 0,
      },
    ],
  },
};

describe('Town', () => {
  const townEmitter: DeepMockProxy<TownEmitter> = mockDeep<TownEmitter>();
  let town: Town;
  let player: Player;
  let playerTestData: MockedPlayer;

  beforeEach(async () => {
    town = new Town(nanoid(), false, nanoid(), townEmitter);
    playerTestData = mockPlayer(town.townID);
    player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
    playerTestData.player = player;
    // Set this dummy player to be off the map so that they do not show up in conversation areas
    playerTestData.moveTo(-1, -1);

    mockReset(townEmitter);
  });

  it('constructor should set its properties', () => {
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townID = nanoid();
    const testTown = new Town(townName, true, townID, townEmitter);
    expect(testTown.friendlyName).toBe(townName);
    expect(testTown.townID).toBe(townID);
    expect(testTown.isPubliclyListed).toBe(true);
  });
  describe('addPlayer', () => {
    it('should use the townID and player ID properties when requesting a video token', async () => {
      const newPlayer = mockPlayer(town.townID);
      mockTwilioVideo.getTokenForTown.mockClear();
      const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);

      expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
      expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
    });
    it('should register callbacks for all client-to-server events', () => {
      const expectedEvents: ClientEventTypes[] = [
        'disconnect',
        'chatMessage',
        'playerMovement',
        'interactableUpdate',
        'petMovement',
        'updateGame',
      ];
      expectedEvents.forEach(eachEvent =>
        expect(getEventListener(playerTestData.socket, eachEvent)).toBeDefined(),
      );
    });
    describe('[T1] interactableUpdate callback', () => {
      let interactableUpdateHandler: (update: Interactable) => void;
      beforeEach(() => {
        town.initializeFromMap(testingMaps.twoConvTwoViewingOneCarn);
        interactableUpdateHandler = getEventListener(playerTestData.socket, 'interactableUpdate');
      });
      it('Should not throw an error for any interactable area that is not a viewing area', () => {
        expect(() =>
          interactableUpdateHandler({ id: 'Name1', topic: nanoid(), occupantsByID: [] }),
        ).not.toThrowError();
      });
      it('Should not throw an error if there is no such viewing area', () => {
        expect(() =>
          interactableUpdateHandler({
            id: 'NotActuallyAnInteractable',
            topic: nanoid(),
            occupantsByID: [],
          }),
        ).not.toThrowError();
      });
      describe('When called passing a valid viewing area', () => {
        let newArea: ViewingAreaModel;
        let secondPlayer: MockedPlayer;
        beforeEach(async () => {
          newArea = {
            id: 'Name3',
            elapsedTimeSec: 0,
            isPlaying: true,
            video: nanoid(),
          };
          expect(town.addViewingArea(newArea)).toBe(true);
          secondPlayer = mockPlayer(town.townID);
          mockTwilioVideo.getTokenForTown.mockClear();
          await town.addPlayer(secondPlayer.userName, secondPlayer.socket);

          newArea.elapsedTimeSec = 100;
          newArea.isPlaying = false;
          mockClear(townEmitter);

          mockClear(secondPlayer.socket);
          mockClear(secondPlayer.socketToRoomMock);
          interactableUpdateHandler(newArea);
        });
        it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
          const updatedArea = town.getInteractable(newArea.id);
          expect(updatedArea.toModel()).toEqual(newArea);
        });
        it('Should update the model for the viewing area', () => {
          const lastUpdate = getLastEmittedEvent(
            playerTestData.socketToRoomMock,
            'interactableUpdate',
          );
          expect(lastUpdate).toEqual(newArea);
        });
        it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
          expect(() =>
            getLastEmittedEvent(playerTestData.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate'),
          ).toThrowError();
        });
      });

      describe('When called passing a valid carnival area', () => {
        let newArea: CarnivalGameAreaModel;
        let secondPlayer: MockedPlayer;
        beforeEach(async () => {
          newArea = {
            id: 'Name5',
            petRule: [{ percentileRangeMax: 100, percentileRangeMin: 0, petSelection: [] }],
          };
          expect(town.addCarnivalGameArea(newArea)).toBe(true);
          secondPlayer = mockPlayer(town.townID);
          mockTwilioVideo.getTokenForTown.mockClear();
          await town.addPlayer(secondPlayer.userName, secondPlayer.socket);
          mockClear(townEmitter);
          mockClear(secondPlayer.socket);
          mockClear(secondPlayer.socketToRoomMock);
          interactableUpdateHandler(newArea);
        });
        it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the carnival area was successfully created", () => {
          const updatedArea = town.getInteractable(newArea.id);
          expect(updatedArea.toModel()).toEqual(newArea);
        });
        it('Should update the model for the viewing area', () => {
          const lastUpdate = getLastEmittedEvent(
            playerTestData.socketToRoomMock,
            'interactableUpdate',
          );
          expect(lastUpdate).toEqual(newArea);
        });
        it('Should not emit interactableUpdate events to players directly', () => {
          expect(() =>
            getLastEmittedEvent(playerTestData.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate'),
          ).toThrowError();
          expect(() =>
            getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate'),
          ).toThrowError();
        });
      });
    });
  });
  describe('Socket event listeners created in addPlayer', () => {
    describe('on socket disconnect', () => {
      function disconnectPlayer(playerToLeave: MockedPlayer) {
        // Call the disconnect event handler
        const disconnectHandler = getEventListener(playerToLeave.socket, 'disconnect');
        disconnectHandler('unknown');
      }
      it("Invalidates the players's session token", async () => {
        const token = player.sessionToken;

        expect(town.getPlayerBySessionToken(token)).toBe(player);
        disconnectPlayer(playerTestData);

        expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
      });
      it('Informs all other players of the disconnection using the broadcast emitter', () => {
        const playerToLeaveID = player.id;

        disconnectPlayer(playerTestData);
        const callToDisconnect = getLastEmittedEvent(townEmitter, 'playerDisconnect');
        expect(callToDisconnect.id).toEqual(playerToLeaveID);
      });
      it('Removes the player from any active conversation area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] }),
        ).toBeTruthy();
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(convArea.occupantsByID).toEqual([]);
        expect(town.occupancy).toBe(0);
      });

      it('Removes the player from any active viewing area', () => {
        // Load in a map with a conversation area
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" area
        expect(
          town.addViewingArea({ id: 'Name3', isPlaying: true, elapsedTimeSec: 0, video: nanoid() }),
        ).toBeTruthy();
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
        disconnectPlayer(playerTestData);
        expect(viewingArea.occupantsByID).toEqual([]);
      });
    });
    describe('gameUpdated', () => {
      let gameUpdateCallback: (key: string) => void;
      const scoreboard = SingletonScoreboardFactory.instance();
      const newModel: CarnivalGameAreaModel = {
        id: 'Name5',
        petRule: [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 10,
            petSelection: [],
          },
        ],
      };
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvTwoViewingOneCarn);
        scoreboard.removePlayerScore(player.toPlayerModel());
        playerTestData.moveTo(605, 1201); // Inside of "Name5" area
        expect(town.addCarnivalGameArea(newModel)).toBe(true);
        const lastEvent = getLastEmittedEvent(playerTestData.socketToRoomMock, 'gameUpdated');
        expect(lastEvent).toBeDefined(); // Should be emitted when player is add into Carnival Game Session
        gameUpdateCallback = getEventListener(playerTestData.socket, 'updateGame');
        gameUpdateCallback('32');
      });

      it('forwards updates to others in the town', () => {
        const lastEvent = getLastEmittedEvent(townEmitter, 'gameUpdated');
        const playerGameSession = {
          isOver: false,
          playerId: player.id,
          score: 1,
          scoreLimit: 100,
          timeLimit: 100,
        };
        expect(lastEvent).toEqual(playerGameSession);
      });

      it('Notify scoreboard when game has ended', () => {
        expect(scoreboard.getAllScores()).toHaveLength(0);
        const endGame = {
          playerId: player.id,
          score: 100,
          scoreLimit: 100,
          isOver: true,
          timeLimit: 100,
        };
        for (let i = 0; i <= 99; i++) {
          gameUpdateCallback('32');
        }
        const lastEvent = getLastEmittedEvent(townEmitter, 'gameUpdated');
        expect(lastEvent).toEqual(endGame);
        expect(scoreboard.getAllScores()).toHaveLength(0);
      });
    });

    describe('PetMoved', () => {
      let petMovementCallBack: (playerLocation: PlayerLocation) => void;
      let actualPet: Pet;
      const playerLocation: PlayerLocation = {
        x: 50,
        y: 100,
        rotation: 'front',
        moving: true,
      };
      const dragon: Pet = {
        id: nanoid(),
        name: 'brown-cobra',
        species: 'brown-cobra',
        movementType: 'offsetPlayer',
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const newModel: CarnivalGameAreaModel = {
        id: 'Name5',
        petRule: [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 101, // For the upperbound
            petSelection: [dragon],
          },
        ],
      };
      beforeEach(() => {
        town.initializeFromMap(testingMaps.twoConvTwoViewingOneCarn);
        playerTestData.moveTo(605, 1201); // Inside of "Name5" area
        expect(town.addCarnivalGameArea(newModel)).toBe(true);
        petMovementCallBack = getEventListener(playerTestData.socket, 'petMovement');
      });

      it('Does not forward updates to the entired town', () => {
        petMovementCallBack(playerLocation);
        expect(() => getLastEmittedEvent(townEmitter, 'petMoved')).toThrowError();
      });

      it('Does not forward updates if the player does not have a pet', () => {
        petMovementCallBack(playerLocation);
        expect(playerTestData.player?.pet).not.toBeDefined();
        expect(() => getLastEmittedEvent(townEmitter, 'petMoved')).toThrowError();
      });

      describe('After the player has completed the Game', () => {
        beforeEach(() => {
          const carnivalGame = <CarnivalGameArea>town.getInteractable('Name5');
          const game = carnivalGame.getGame(player.id);
          game.isOver(true); // Overide the game state to end
          carnivalGame.notifyScoreBoard(player.id);
          actualPet = carnivalGame.assignPetToPlayer(player.id, 'lemmy');
        });

        it('Pet should be spawned', () => {
          expect(playerTestData.player?.pet).toBeDefined();
        });

        it('Pet movement move next', () => {
          petMovementCallBack(playerLocation);
          const lastEvent = getLastEmittedEvent(townEmitter, 'petMoved');
          const expectedPet: Pet = {
            id: actualPet.id,
            name: 'lemmy',
            species: 'brown-cobra',
            movementType: 'offsetPlayer',
            x: 10,
            y: 120,
            rotation: 'front',
          };
          expect(lastEvent.pet).toEqual(expectedPet);
        });
      });
    });
    describe('playerMovement', () => {
      const newLocation: PlayerLocation = {
        x: 100,
        y: 100,
        rotation: 'back',
        moving: true,
      };

      beforeEach(() => {
        playerTestData.moveTo(
          newLocation.x,
          newLocation.y,
          newLocation.rotation,
          newLocation.moving,
        );
      });

      it('Emits a playerMoved event', () => {
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.id).toEqual(playerTestData.player?.id);
        expect(lastEmittedMovement.location).toEqual(newLocation);
      });
      it("Updates the player's location", () => {
        expect(player.location).toEqual(newLocation);
      });
    });
    describe('interactableUpdate', () => {
      let interactableUpdateCallback: (update: Interactable) => void;
      let update: ViewingAreaModel;
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOneViewing);
        playerTestData.moveTo(156, 567); // Inside of "Name3" viewing area
        interactableUpdateCallback = getEventListener(playerTestData.socket, 'interactableUpdate');
        update = {
          id: 'Name3',
          isPlaying: true,
          elapsedTimeSec: 100,
          video: nanoid(),
        };
        interactableUpdateCallback(update);
      });
      it('forwards updates to others in the town', () => {
        const lastEvent = getLastEmittedEvent(
          playerTestData.socketToRoomMock,
          'interactableUpdate',
        );
        expect(lastEvent).toEqual(update);
      });
      it('does not forward updates to the ENTIRE town', () => {
        expect(
          // getLastEmittedEvent will throw an error if no event was emitted, which we expect to be the case here
          () => getLastEmittedEvent(townEmitter, 'interactableUpdate'),
        ).toThrowError();
      });
      it('updates the local model for that interactable', () => {
        const interactable = town.getInteractable(update.id);
        expect(interactable?.toModel()).toEqual(update);
      });
    });
    it('[OMG1 chatMessage] Forwards chat messages to players with the same ID as the message ID', async () => {
      const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
      const chatMessage: ChatMessage = {
        author: player.id,
        body: 'Test message',
        dateCreated: new Date(),
        sid: 'test message id',
        interactableId: player.location?.interactableID,
      };

      chatHandler(chatMessage);

      const emittedMessage = getLastEmittedEvent(playerTestData.socket, 'chatMessage');
      expect(emittedMessage).toEqual(chatMessage);
    });
    it('Does not forward chat messages to players if the message ID doesnt match the player area', async () => {
      const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
      const chatMessage: ChatMessage = {
        author: player.id,
        body: 'Test message',
        dateCreated: new Date(),
        sid: 'test message id',
        interactableId: 'random id',
      };

      chatHandler(chatMessage);

      expect(() => {
        getLastEmittedEvent(playerTestData.socket, 'chatMessage');
      }).toThrowError();
    });
  });
  describe('addConversationArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addConversationArea({ id: nanoid(), topic: nanoid(), occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the requested topic is empty', () => {
      expect(town.addConversationArea({ id: 'Name1', topic: '', occupantsByID: [] })).toEqual(
        false,
      );
      expect(
        town.addConversationArea({ id: 'Name1', topic: undefined, occupantsByID: [] }),
      ).toEqual(false);
    });
    it('Should return false if the area already has a topic', () => {
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new topic', occupantsByID: [] }),
      ).toEqual(true);
      expect(
        town.addConversationArea({ id: 'Name1', topic: 'new new topic', occupantsByID: [] }),
      ).toEqual(false);
    });
    describe('When successful', () => {
      const newTopic = 'new topic';
      beforeEach(() => {
        playerTestData.moveTo(45, 122); // Inside of "Name1" area
        expect(
          town.addConversationArea({ id: 'Name1', topic: newTopic, occupantsByID: [] }),
        ).toEqual(true);
      });
      it('Should update the local model for that area', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.topic).toEqual(newTopic);
      });
      it('Should include any players in that area as occupants', () => {
        const convArea = town.getInteractable('Name1') as ConversationArea;
        expect(convArea.occupantsByID).toEqual([player.id]);
      });
      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual({
          id: 'Name1',
          topic: newTopic,
          occupantsByID: [player.id],
        });
      });
    });
  });

  describe('addCarnivalGameArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvTwoViewingOneCarn);
    });

    it('Should return false if no area exists with that ID', () => {
      expect(town.addCarnivalGameArea({ id: nanoid(), petRule: [] })).toBe(false);
    });

    it('Should return false if given carnival game area contain empty pet rule', () => {
      expect(town.addCarnivalGameArea({ id: 'Name5', petRule: [] })).toBe(false);
    });

    describe('When successful', () => {
      const newModel: CarnivalGameAreaModel = {
        id: 'Name5',
        petRule: [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 10,
            petSelection: [],
          },
        ],
      };

      beforeEach(() => {
        playerTestData.moveTo(605, 1201); // Inside of "Name5" area
        expect(town.addCarnivalGameArea(newModel)).toBe(true);
      });

      it('Should update the local model for that area', () => {
        const carnivalGameArea = town.getInteractable('Name5');
        expect(carnivalGameArea.toModel()).toEqual(newModel);
      });

      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual(newModel);
      });
      it('Should include any players in that area as occupants', () => {
        const carnivalGameArea = town.getInteractable('Name5');
        expect(carnivalGameArea.occupantsByID).toEqual([player.id]);
      });
    });
  });
  describe('[T1] addViewingArea', () => {
    beforeEach(async () => {
      town.initializeFromMap(testingMaps.twoConvOneViewing);
    });
    it('Should return false if no area exists with that ID', () => {
      expect(
        town.addViewingArea({ id: nanoid(), isPlaying: false, elapsedTimeSec: 0, video: nanoid() }),
      ).toBe(false);
    });
    it('Should return false if the requested video is empty', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: '' }),
      ).toBe(false);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: undefined }),
      ).toBe(false);
    });
    it('Should return false if the area is already active', () => {
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test' }),
      ).toBe(true);
      expect(
        town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test2' }),
      ).toBe(false);
    });
    describe('When successful', () => {
      const newModel: ViewingAreaModel = {
        id: 'Name3',
        isPlaying: true,
        elapsedTimeSec: 100,
        video: nanoid(),
      };
      beforeEach(() => {
        playerTestData.moveTo(160, 570); // Inside of "Name3" area
        expect(town.addViewingArea(newModel)).toBe(true);
      });

      it('Should update the local model for that area', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.toModel()).toEqual(newModel);
      });

      it('Should emit an interactableUpdate message', () => {
        const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
        expect(lastEmittedUpdate).toEqual(newModel);
      });
      it('Should include any players in that area as occupants', () => {
        const viewingArea = town.getInteractable('Name3');
        expect(viewingArea.occupantsByID).toEqual([player.id]);
      });
    });
  });

  describe('disconnectAllPlayers', () => {
    beforeEach(() => {
      town.disconnectAllPlayers();
    });
    it('Should emit the townClosing event', () => {
      getLastEmittedEvent(townEmitter, 'townClosing'); // Throws an error if no event existed
    });
    it("Should disconnect each players's socket", () => {
      expect(playerTestData.socket.disconnect).toBeCalledWith(true);
    });
  });
  describe('[OMG4 initializeFromMap]', () => {
    const expectInitializingFromMapToThrowError = (map: ITiledMap) => {
      expect(() => town.initializeFromMap(map)).toThrowError();
    };
    it('Throws an error if there is no layer called "objects"', async () => {
      expectInitializingFromMapToThrowError(testingMaps.noObjects);
    });
    it('Throws an error if there are duplicate interactable object IDs', async () => {
      expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
    });
    it('Throws an error if there are overlapping objects', async () => {
      expectInitializingFromMapToThrowError(testingMaps.overlapping);
    });
    it('Creates a ConversationArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoConv);
      const conv1 = town.getInteractable('Name1');
      const conv2 = town.getInteractable('Name2');
      expect(conv1.id).toEqual('Name1');
      expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(conv2.id).toEqual('Name2');
      expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    it('Creates a ViewingArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoViewing);
      const viewingArea1 = town.getInteractable('Name1');
      const viewingArea2 = town.getInteractable('Name2');
      expect(viewingArea1.id).toEqual('Name1');
      expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(viewingArea2.id).toEqual('Name2');
      expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    it('Creates a PosterSessionArea instance for each region on the map', async () => {
      town.initializeFromMap(testingMaps.twoPosters);
      const posterSessionArea1 = town.getInteractable('Name1');
      const posterSessionArea2 = town.getInteractable('Name2');
      expect(posterSessionArea1.id).toEqual('Name1');
      expect(posterSessionArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
      expect(posterSessionArea2.id).toEqual('Name2');
      expect(posterSessionArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
      expect(town.interactables.length).toBe(2);
    });
    describe('Updating interactable state in playerMovements', () => {
      beforeEach(async () => {
        town.initializeFromMap(testingMaps.twoConvOnePoster);
        playerTestData.moveTo(51, 121);
        expect(town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] })).toBe(
          true,
        );
      });
      it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
        const newPlayer = mockPlayer(town.townID);
        const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
        newPlayer.moveTo(51, 121);

        // Check that the player's location was updated
        expect(newPlayerObj.location.interactableID).toEqual('Name1');

        // Check that a movement event was emitted with the correct label
        const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
        expect(lastEmittedMovement.location.interactableID).toEqual('Name1');

        // Check that the conversation area occupants was updated
        const occupants = town.getInteractable('Name1').occupantsByID;
        expectArraysToContainSameMembers(occupants, [newPlayerObj.id, player.id]);
      });
      it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
        expect(player.location.interactableID).toEqual('Name1');
        playerTestData.moveTo(0, 0);
        expect(player.location.interactableID).toBeUndefined();
      });
    });
  });
  describe('Updating town settings', () => {
    it('Emits townSettingsUpdated events when friendlyName changes', async () => {
      const newFriendlyName = nanoid();
      town.friendlyName = newFriendlyName;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        friendlyName: newFriendlyName,
      });
    });
    it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
      const expected = !town.isPubliclyListed;
      town.isPubliclyListed = expected;
      expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
        isPubliclyListed: expected,
      });
    });
  });
});

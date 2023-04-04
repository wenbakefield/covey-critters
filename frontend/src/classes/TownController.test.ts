import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { LoginController } from '../contexts/LoginControllerContext';
import {
  EventNames,
  getEventListener,
  mockTownControllerConnection,
  ReceivedEventParameter,
} from '../TestUtils';
import {
  ChatMessage,
  ConversationArea as ConversationAreaModel,
  CarnivalGameArea,
  PosterSessionArea,
  GameSession,
  ViewingArea,
  CoveyTownSocket,
  Pet,
  PetOwnerMap,
  Player as PlayerModel,
  PlayerLocation,
  ServerToClientEvents,
  TownJoinResponse,
} from '../types/CoveyTownSocket';
import {
  isCarnivalGameArea,
  isConversationArea,
  isPosterSessionArea,
  isViewingArea,
} from '../types/TypeUtils';
import CarnivalGameAreaController from './CarnivalGameAreaController';
import PetController from './PetController';
import PlayerController from './PlayerController';
import PosterSessionAreaController from './PosterSessionAreaController';
import SpaceBarGameController from './SBGameController';
import TownController, { TownEvents } from './TownController';
import ViewingAreaController from './ViewingAreaController';

/**
 * Mocks the socket-io client constructor such that it will always return the same
 * mockSocket instance. Returns that mockSocket instance to the caller of this function,
 * allowing tests to make assertions about the messages emitted to the socket, and also to
 * simulate the receipt of events, @see getEventListener
 */
const mockSocket = mock<CoveyTownSocket>();
jest.mock('socket.io-client', () => {
  const actual = jest.requireActual('socket.io-client');
  return {
    ...actual,
    io: () => mockSocket,
  };
});

describe('TownController', () => {
  let mockLoginController: MockProxy<LoginController>;
  let userName: string;
  let townID: string;
  beforeAll(() => {
    mockLoginController = mock<LoginController>();
    process.env.REACT_APP_TOWNS_SERVICE_URL = 'test';
  });
  let testController: TownController;

  /**
   * Testing harness that mocks the arrival of an event from the CoveyTownSocket and expects that
   * a given listener is invoked, optionally with an expected listener parameter.
   *
   * Returns a mock listener callback that represents the listener under expectation
   *
   * @param receivedEvent
   * @param receivedParameter
   * @param listenerToExpect
   * @param expectedListenerParam
   * @returns mock listener mock
   */
  const emitEventAndExpectListenerFiring = <
    ReceivedEventFromSocket extends EventNames<ServerToClientEvents>,
    ExpectedListenerName extends EventNames<TownEvents>,
  >(
    receivedEvent: ReceivedEventFromSocket,
    receivedParameter: ReceivedEventParameter<ReceivedEventFromSocket>,
    listenerToExpect: ExpectedListenerName,
    expectedListenerParam?: Parameters<TownEvents[ExpectedListenerName]>[0],
  ): jest.MockedFunction<TownEvents[ExpectedListenerName]> => {
    const eventListener = getEventListener(mockSocket, receivedEvent);
    const mockListener = jest.fn() as jest.MockedFunction<TownEvents[ExpectedListenerName]>;
    testController.addListener(listenerToExpect, mockListener);
    eventListener(receivedParameter);
    if (expectedListenerParam === undefined) {
      expect(mockListener).toHaveBeenCalled();
    } else {
      expect(mockListener).toHaveBeenCalledWith(expectedListenerParam);
    }
    return mockListener;
  };

  beforeEach(() => {
    mockClear(mockSocket);
    userName = nanoid();
    townID = nanoid();
    testController = new TownController({ userName, townID, loginController: mockLoginController });
  });
  describe('With an unsuccesful connection', () => {
    it('Throws an error', async () => {
      mockSocket.on.mockImplementation((eventName, eventListener) => {
        if (eventName === 'disconnect') {
          const listener = eventListener as () => void;
          listener();
        }
        return mockSocket;
      });
      await expect(testController.connect()).rejects.toThrowError();
      mockSocket.on.mockReset();
    });
  });
  describe('With a successful connection', () => {
    let townJoinResponse: TownJoinResponse;

    beforeEach(async () => {
      townJoinResponse = await mockTownControllerConnection(testController, mockSocket);
    });

    describe('PetController', () => {
      let petModel: Pet;
      let petController: PetController;
      let petListener: (pet: PetOwnerMap) => void;

      beforeEach(() => {
        petModel = {
          id: nanoid(),
          name: 'lemmy',
          movementType: 'offsetPlayer',
          species: 'black-bear',
          x: 0,
          y: 0,
          rotation: 'front',
        };
        petController = PetController.fromModel(petModel);
        petListener = getEventListener(mockSocket, 'petMoved');
      });
      it('petMoved assing PetController to playerController if petController does not exists', () => {
        expect(testController.ourPlayer.pet).toBeUndefined();
        petListener({
          playerId: testController.ourPlayer.id,
          pet: petModel,
        });
        expect(testController.ourPlayer.pet).toBeDefined();
      });
      it('Dispatch petMovementChange when new pet update event is emitted from backend', () => {
        testController.ourPlayer.pet = petController;
        const listener = jest.fn();
        petController.addListener('petMovementChange', listener);
        const newPet = {
          id: petModel.id,
          name: 'lemmy',
          movementType: 'offsetPlayer',
          species: 'black-bear',
          x: 10,
          y: 20,
          rotation: 'front',
        };
        petListener({
          playerId: testController.ourPlayer.id,
          pet: newPet,
        });
        expect(petController.toModel()).toEqual(newPet);
        expect(listener).toBeCalledWith(newPet.x, newPet.y);
      });
      it('Dispatch petNameChange when new pet update event is emitted from backend', () => {
        testController.ourPlayer.pet = petController;
        const listener = jest.fn();
        petController.addListener('petNameChange', listener);
        const newPet = {
          id: petModel.id,
          name: 'mmm',
          movementType: 'offsetPlayer',
          species: 'black-bear',
          x: 0,
          y: 0,
          rotation: 'front',
        };
        petListener({
          playerId: testController.ourPlayer.id,
          pet: newPet,
        });
        expect(petController.toModel()).toEqual(newPet);
        expect(listener).toBeCalledWith('mmm');
      });
    });
    it('Initializes the properties of the controller', () => {
      expect(testController.providerVideoToken).toEqual(townJoinResponse.providerVideoToken);
      expect(testController.friendlyName).toEqual(townJoinResponse.friendlyName);
      expect(testController.townIsPubliclyListed).toEqual(townJoinResponse.isPubliclyListed);
      expect(testController.sessionToken).toEqual(townJoinResponse.sessionToken);
      expect(testController.userID).toEqual(townJoinResponse.userID);
    });

    it('Forwards update town calls to local CoveyTownEvents listeners', () => {
      const newFriendlyName = nanoid();
      emitEventAndExpectListenerFiring(
        'townSettingsUpdated',
        { friendlyName: newFriendlyName },
        'townSettingsUpdated',
        { friendlyName: newFriendlyName },
      );
    });
    it('Forwards delete town calls to local CoveyTownEvents listeners', () => {
      emitEventAndExpectListenerFiring('townClosing', undefined, 'disconnect', undefined);
    });
    it('Forwards chat messages to local CoveyTownEvents listeners', () => {
      const message: ChatMessage = {
        author: nanoid(),
        body: nanoid(),
        dateCreated: new Date(),
        sid: nanoid(),
      };
      emitEventAndExpectListenerFiring('chatMessage', message, 'chatMessage', message);
    });
    it("Emit the local pet's movement updates to the socket and to locally subscribed ConveyTownEvents listener", () => {
      const newLocation: PlayerLocation = { ...testController.ourPlayer.location, x: 10, y: 10 };
      testController.ourPlayer.pet = PetController.fromModel({
        id: nanoid(),
        name: 'lemmy',
        movementType: 'offsetPlayer',
        species: 'black-bear',
        x: 0,
        y: 0,
        rotation: 'front',
      });
      const expectPetUpdate = testController.ourPlayer.pet;
      const movedPetListener = jest.fn();

      testController.addListener('petMoved', movedPetListener);
      testController.emitMovement(newLocation);

      expect(mockSocket.emit).toBeCalledWith('petMovement', newLocation);
      expect(movedPetListener).toBeCalledWith(expectPetUpdate);
    });
    it('Emit the local game updates to the socket and to locally subscribed ConveyTownEvents listener', () => {
      testController.emitGameOnTick('32');
      expect(mockSocket.emit).toBeCalledWith('updateGame', '32');
    });
    it("Emits the local player's movement updates to the socket and to locally subscribed CoveyTownEvents listeners", () => {
      const newLocation: PlayerLocation = { ...testController.ourPlayer.location, x: 10, y: 10 };
      const expectedPlayerUpdate = testController.ourPlayer;
      expectedPlayerUpdate.location = newLocation;
      const movedPlayerListener = jest.fn();

      testController.addListener('playerMoved', movedPlayerListener);

      testController.emitMovement(newLocation);

      //Emits the event to the socket
      expect(mockSocket.emit).toBeCalledWith('playerMovement', newLocation);

      //Emits the playerMovement event to locally subscribed listerners, indicating that the player moved
      expect(movedPlayerListener).toBeCalledWith(expectedPlayerUpdate);

      //Uses the correct (new) location when emitting that update locally
      expect(expectedPlayerUpdate.location).toEqual(newLocation);
    });
    it('Emits locally written chat messages to the socket, and dispatches no other events', () => {
      const testMessage: ChatMessage = {
        author: nanoid(),
        body: nanoid(),
        dateCreated: new Date(),
        sid: nanoid(),
      };
      testController.emitChatMessage(testMessage);

      expect(mockSocket.emit).toBeCalledWith('chatMessage', testMessage);
    });
    it('Emits conversationAreasChanged when a conversation area is created', () => {
      const newConvArea = townJoinResponse.interactables.find(
        eachInteractable => isConversationArea(eachInteractable) && !eachInteractable.topic,
      ) as ConversationAreaModel;
      if (newConvArea) {
        newConvArea.topic = nanoid();
        newConvArea.occupantsByID = [townJoinResponse.userID];
        const event = emitEventAndExpectListenerFiring(
          'interactableUpdate',
          newConvArea,
          'conversationAreasChanged',
        );
        const changedAreasArray = event.mock.calls[0][0];
        expect(changedAreasArray.find(eachConvArea => eachConvArea.id === newConvArea.id)?.topic);
      } else {
        fail('Did not find an existing, empty conversation area in the town join response');
      }
    });
    describe('[T2] interactableUpdate events', () => {
      describe('Conversation Area updates', () => {
        function emptyConversationArea() {
          return {
            ...(townJoinResponse.interactables.find(
              eachInteractable =>
                isConversationArea(eachInteractable) && eachInteractable.occupantsByID.length == 0,
            ) as ConversationAreaModel),
          };
        }
        function occupiedConversationArea() {
          return {
            ...(townJoinResponse.interactables.find(
              eachInteractable =>
                isConversationArea(eachInteractable) && eachInteractable.occupantsByID.length > 0,
            ) as ConversationAreaModel),
          };
        }
        it('Emits a conversationAreasChanged event with the updated list of conversation areas if the area is newly occupied', () => {
          const convArea = emptyConversationArea();
          convArea.occupantsByID = [townJoinResponse.userID];
          convArea.topic = nanoid();
          const updatedConversationAreas = testController.conversationAreas;

          emitEventAndExpectListenerFiring(
            'interactableUpdate',
            convArea,
            'conversationAreasChanged',
            updatedConversationAreas,
          );

          const updatedController = updatedConversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          expect(updatedController?.topic).toEqual(convArea.topic);
          expect(updatedController?.occupants.map(eachOccupant => eachOccupant.id)).toEqual(
            convArea.occupantsByID,
          );
          expect(updatedController?.toConversationAreaModel()).toEqual({
            id: convArea.id,
            topic: convArea.topic,
            occupantsByID: [townJoinResponse.userID],
          });
        });
        it('Emits a conversationAreasChanged event with the updated list of converation areas if the area is newly vacant', () => {
          const convArea = occupiedConversationArea();
          convArea.occupantsByID = [];
          convArea.topic = undefined;
          const updatedConversationAreas = testController.conversationAreas;

          emitEventAndExpectListenerFiring(
            'interactableUpdate',
            convArea,
            'conversationAreasChanged',
            updatedConversationAreas,
          );
          const updatedController = updatedConversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          expect(updatedController?.topic).toEqual(convArea.topic);
          expect(updatedController?.occupants.map(eachOccupant => eachOccupant.id)).toEqual(
            convArea.occupantsByID,
          );
        });
        it('Does not emit a conversationAreasChanged event if the set of active areas has not changed', () => {
          const convArea = occupiedConversationArea();
          convArea.topic = nanoid();
          const updatedConversationAreas = testController.conversationAreas;

          const eventListener = getEventListener(mockSocket, 'interactableUpdate');
          const mockListener = jest.fn() as jest.MockedFunction<
            TownEvents['conversationAreasChanged']
          >;
          testController.addListener('conversationAreasChanged', mockListener);
          eventListener(convArea);
          expect(mockListener).not.toBeCalled();

          const updatedController = updatedConversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          expect(updatedController?.topic).toEqual(convArea.topic);
          expect(updatedController?.occupants.map(eachOccupant => eachOccupant.id)).toEqual(
            convArea.occupantsByID,
          );
        });
        it('Emits a topicChange event if the topic of a conversation area changes', () => {
          const convArea = occupiedConversationArea();
          convArea.topic = nanoid();
          //Set up a topicChange listener
          const topicChangeListener = jest.fn();
          const convAreaController = testController.conversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          if (!convAreaController) {
            fail('Could not find conversation area controller');
            return;
          }
          convAreaController.addListener('topicChange', topicChangeListener);

          // Perform the update
          const eventListener = getEventListener(mockSocket, 'interactableUpdate');
          eventListener(convArea);

          expect(topicChangeListener).toBeCalledWith(convArea.topic);
        });
        it('Does not emit a topicChange event if the topic is unchanged', () => {
          const convArea = occupiedConversationArea();
          //Set up a topicChange listener
          const topicChangeListener = jest.fn();
          const convAreaController = testController.conversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          if (!convAreaController) {
            fail('Could not find conversation area controller');
          }
          convAreaController.addListener('topicChange', topicChangeListener);

          // Perform the update
          const eventListener = getEventListener(mockSocket, 'interactableUpdate');
          eventListener(convArea);

          expect(topicChangeListener).not.toBeCalled();
        });
        it('Emits an occupantsChange event if the occupants changed', () => {
          const convArea = occupiedConversationArea();
          convArea.occupantsByID = [townJoinResponse.userID, townJoinResponse.currentPlayers[1].id];

          //Set up an occupantsChange listener
          const occupantsChangeListener = jest.fn();
          const convAreaController = testController.conversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          if (!convAreaController) {
            fail('Could not find conversation area controller');
          }
          convAreaController.addListener('occupantsChange', occupantsChangeListener);

          // Perform the update
          const eventListener = getEventListener(mockSocket, 'interactableUpdate');
          eventListener(convArea);

          expect(occupantsChangeListener).toBeCalledTimes(1);
        });
        it('Does not emit an occupantsChange if the occupants have not changed', () => {
          const convArea = occupiedConversationArea();
          convArea.topic = nanoid();

          //Set up an occupantsChange listener
          const occupantsChangeListener = jest.fn();
          const convAreaController = testController.conversationAreas.find(
            eachArea => eachArea.id === convArea.id,
          );
          if (!convAreaController) {
            fail('Could not find conversation area controller');
          }
          convAreaController.addListener('occupantsChange', occupantsChangeListener);

          // Perform the update
          const eventListener = getEventListener(mockSocket, 'interactableUpdate');
          eventListener(convArea);

          expect(occupantsChangeListener).not.toBeCalled();
        });
      });
      describe('Viewing Area updates', () => {
        function viewingAreaOnTown() {
          return {
            ...(townJoinResponse.interactables.find(eachInteractable =>
              isViewingArea(eachInteractable),
            ) as ViewingArea),
          };
        }
        let viewingArea: ViewingArea;
        let viewingAreaController: ViewingAreaController;
        let eventListener: (update: ViewingArea) => void;
        beforeEach(() => {
          viewingArea = viewingAreaOnTown();
          const controller = testController.viewingAreas.find(
            eachArea => eachArea.id === viewingArea.id,
          );
          if (!controller) {
            fail(`Could not find viewing area controller for viewing area ${viewingArea.id}`);
          }
          viewingAreaController = controller;
          eventListener = getEventListener(mockSocket, 'interactableUpdate');
        });
        it('Updates the viewing area model', () => {
          viewingArea.video = nanoid();
          viewingArea.elapsedTimeSec++;
          viewingArea.isPlaying = !viewingArea.isPlaying;

          eventListener(viewingArea);

          expect(viewingAreaController.viewingAreaModel()).toEqual(viewingArea);
        });
        it('Emits a playbackChange event if isPlaying changes', () => {
          const listener = jest.fn();
          viewingAreaController.addListener('playbackChange', listener);

          viewingArea.isPlaying = !viewingArea.isPlaying;
          eventListener(viewingArea);
          expect(listener).toBeCalledWith(viewingArea.isPlaying);
        });
        it('Emits a progressChange event if the elapsedTimeSec chagnes', () => {
          const listener = jest.fn();
          viewingAreaController.addListener('progressChange', listener);

          viewingArea.elapsedTimeSec++;
          eventListener(viewingArea);
          expect(listener).toBeCalledWith(viewingArea.elapsedTimeSec);
        });
        it('Emits a videoChange event if the video changes', () => {
          const listener = jest.fn();
          viewingAreaController.addListener('videoChange', listener);

          viewingArea.video = nanoid();
          eventListener(viewingArea);
          expect(listener).toBeCalledWith(viewingArea.video);
        });
      });
      describe('[REE1] PosterSessionAreaController Poster Session Area updates', () => {
        function posterSessionAreaOnTown() {
          return {
            ...(townJoinResponse.interactables.find(eachInteractable =>
              isPosterSessionArea(eachInteractable),
            ) as PosterSessionArea),
          };
        }
        let posterSessionArea: PosterSessionArea;
        let posterSessionAreaController: PosterSessionAreaController;
        let eventListener: (update: PosterSessionArea) => void;
        beforeEach(() => {
          posterSessionArea = posterSessionAreaOnTown();
          const controller = testController.posterSessionAreas.find(
            eachArea => eachArea.id === posterSessionArea.id,
          );
          if (!controller) {
            fail(
              `Could not find postersession area controller for poster session area ${posterSessionArea.id}`,
            );
          }
          posterSessionAreaController = controller;
          eventListener = getEventListener(mockSocket, 'interactableUpdate');
        });
        it('[REE1] interactableUpdate and poster hooks Updates the poster session area model', () => {
          posterSessionArea.imageContents = nanoid();
          posterSessionArea.stars++;
          posterSessionArea.title = 'New Title';

          eventListener(posterSessionArea);

          expect(posterSessionAreaController.posterSessionAreaModel()).toEqual(posterSessionArea);
        });
        it('[REE1] interactableUpdate and poster hooks Emits a posterStarChange event if the number of stars changes', () => {
          const listener = jest.fn();
          posterSessionAreaController.addListener('posterStarChange', listener);

          posterSessionArea.stars++;
          eventListener(posterSessionArea);
          expect(listener).toBeCalledWith(posterSessionArea.stars);
        });
        it('[REE1] interactableUpdate and poster hooks Emits a posterTitleEvent event if the title changes', () => {
          const listener = jest.fn();
          posterSessionAreaController.addListener('posterTitleChange', listener);

          posterSessionArea.title = nanoid();
          eventListener(posterSessionArea);
          expect(listener).toBeCalledWith(posterSessionArea.title);
        });
        it('[REE1] interactableUpdate and poster hooks Emits a posterImageContentsChange event if the image contents changes', () => {
          const listener = jest.fn();
          posterSessionAreaController.addListener('posterImageContentsChange', listener);

          posterSessionArea.imageContents = nanoid();
          eventListener(posterSessionArea);
          expect(listener).toBeCalledWith(posterSessionArea.imageContents);
        });
      });
      describe('[REE1] CarnivalGameArea Area updates', () => {
        function carnivalGameAreaOnTown() {
          return {
            ...(townJoinResponse.interactables.find(eachInteractable =>
              isCarnivalGameArea(eachInteractable),
            ) as CarnivalGameArea),
          };
        }
        let eventListener: (update: CarnivalGameArea) => void;
        let carnivalGameArea: CarnivalGameArea;
        let carnivalGameAreaController: CarnivalGameAreaController;

        beforeEach(() => {
          carnivalGameArea = carnivalGameAreaOnTown();
          const controller = testController.carnivalGameAreas.find(
            eachArea => eachArea.id === carnivalGameArea.id,
          );
          if (!controller) {
            fail(
              `Could not find carnivalGame area controller for carnivalGame area ${carnivalGameArea.id}`,
            );
          }
          carnivalGameAreaController = controller;
          eventListener = getEventListener(mockSocket, 'interactableUpdate');
        });
        it('[REE1] interactables and CarnivalGameArea hooks Updates the CarnivalGameArea Model', () => {
          carnivalGameArea.petRule = [
            {
              percentileRangeMin: 0,
              percentileRangeMax: 100,
              petSelection: [
                {
                  id: nanoid(),
                  name: 'lemmy',
                  movementType: 'offsetPlayer',
                  species: 'brown-cobra',
                  x: 0,
                  y: 0,
                  rotation: 'front',
                },
              ],
            },
          ];

          eventListener(carnivalGameArea);
          expect(carnivalGameAreaController.carnivalGameAreaModel()).toEqual(carnivalGameArea);
        });
        it('[REE1] interactableUpdate and carnivalGameArea hooks Emits a petRuleChange event if the number of petRule changes', () => {
          const listener = jest.fn();
          carnivalGameAreaController.addListener('petRuleChange', listener);

          carnivalGameArea.petRule = [
            {
              percentileRangeMin: 0,
              percentileRangeMax: 100,
              petSelection: [
                {
                  id: nanoid(),
                  name: 'lemmy',
                  movementType: 'offsetPlayer',
                  species: 'brown-cobra',
                  x: 0,
                  y: 0,
                  rotation: 'front',
                },
              ],
            },
          ];
          eventListener(carnivalGameArea);
          expect(listener).toBeCalledWith(carnivalGameArea.petRule);
        });

        describe('SpaceBarGame Updates', () => {
          let spaceBarGame: GameSession;
          let spaceBarGameController: SpaceBarGameController;
          let gameListener: (update: GameSession) => void;

          beforeEach(() => {
            spaceBarGame = {
              playerId: testController.ourPlayer.id,
              score: 0,
              scoreLimit: 100,
              isOver: false,
              timeLimit: 100,
            };
            spaceBarGameController = SpaceBarGameController.fromModel(spaceBarGame);
            gameListener = getEventListener(mockSocket, 'gameUpdated');
          });
          it('SpaceBar game hooks should dispatch gameModel update', () => {
            carnivalGameAreaController.addGameSession(spaceBarGameController);
            spaceBarGame.score = 10;
            spaceBarGame.isOver = false;
            const listener = jest.fn();
            spaceBarGameController.addListener('gameChanged', listener);
            gameListener(spaceBarGame);
            expect(spaceBarGameController.toModel()).toEqual(spaceBarGame);
            expect(listener).toBeCalledWith(spaceBarGame);
          });
          it('SpaceBar game hooks should dispatch gameTimeOut when updated game timeout', () => {
            carnivalGameAreaController.addGameSession(spaceBarGameController);
            spaceBarGame.score = 10;
            spaceBarGame.isOver = true;
            const listener = jest.fn();
            spaceBarGameController.addListener('gameTimeOut', listener);
            gameListener(spaceBarGame);
            expect(spaceBarGameController.toModel()).toEqual(spaceBarGame);
            expect(listener).toBeCalledWith(true);
          });
        });
      });
    });
  });
  describe('Processing events that are received over the socket from the townService', () => {
    let testPlayer: PlayerModel;
    let testPlayerPlayersChangedFn: jest.MockedFunction<TownEvents['playersChanged']>;

    beforeEach(() => {
      //Create a new PlayerModel
      testPlayer = {
        id: nanoid(),
        location: { moving: false, rotation: 'back', x: 0, y: 1, interactableID: nanoid() },
        userName: nanoid(),
        pet: undefined,
      };
      //Add that player to the test town
      testPlayerPlayersChangedFn = emitEventAndExpectListenerFiring(
        'playerJoined',
        testPlayer,
        'playersChanged',
      );
    });
    it('Emits playersChanged events when players join', () => {
      expect(testPlayerPlayersChangedFn).toBeCalledWith([
        PlayerController.fromPlayerModel(testPlayer),
      ]);
    });

    it('Emits playersChanged events when players leave', () => {
      emitEventAndExpectListenerFiring('playerDisconnect', testPlayer, 'playersChanged', []);
    });
    it('Emits playerMoved events when players join', async () => {
      emitEventAndExpectListenerFiring(
        'playerJoined',
        testPlayer,
        'playerMoved',
        PlayerController.fromPlayerModel(testPlayer),
      );
    });

    it('Emits petMoved events when a pet move', async () => {
      const petOwner: PetOwnerMap = {
        playerId: testPlayer.id,
        pet: {
          id: nanoid(),
          name: 'lemmy',
          movementType: 'offsetPlayer',
          species: 'black-bear',
          x: 0,
          y: 0,
          rotation: 'front',
        },
      };
      emitEventAndExpectListenerFiring(
        'petMoved',
        petOwner,
        'petMoved',
        PetController.fromModel(petOwner.pet),
      );
    });
    it('Emits playerMoved events when players move', async () => {
      testPlayer.location = {
        moving: true,
        rotation: 'front',
        x: 1,
        y: 0,
        interactableID: nanoid(),
      };
      emitEventAndExpectListenerFiring(
        'playerMoved',
        testPlayer,
        'playerMoved',
        PlayerController.fromPlayerModel(testPlayer),
      );
    });
  });
  it('Disconnects the socket and clears the coveyTownController when disconnection', async () => {
    emitEventAndExpectListenerFiring('townClosing', undefined, 'disconnect');
    expect(mockLoginController.setTownController).toBeCalledWith(null);
  });
});

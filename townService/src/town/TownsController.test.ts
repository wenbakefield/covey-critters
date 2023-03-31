import assert from 'assert';
import { DeepMockProxy, mockDeep, mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Town } from '../api/Model';
import {
  ConversationArea,
  Interactable,
  TownEmitter,
  ViewingArea,
  CarnivalGameArea,
  PetRule,
} from '../types/CoveyTownSocket';
import TownsStore from '../lib/TownsStore';
import {
  createConversationForTesting,
  getLastEmittedEvent,
  extractSessionToken,
  mockPlayer,
  isViewingArea,
  isConversationArea,
  MockedPlayer,
  isCarnivalGameArea,
} from '../TestUtils';
import { TownsController } from './TownsController';
import Player from '../lib/Player';

type TestTownData = {
  friendlyName: string;
  townID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};

function expectTownListMatches(towns: Town[], town: TestTownData) {
  const matching = towns.find(townInfo => townInfo.townID === town.townID);
  if (town.isPubliclyListed) {
    expect(matching).toBeDefined();
    assert(matching);
    expect(matching.friendlyName).toBe(town.friendlyName);
  } else {
    expect(matching).toBeUndefined();
  }
}

const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
  let controller: TownsController;

  const createdTownEmitters: Map<string, DeepMockProxy<TownEmitter>> = new Map();
  async function createTownForTesting(
    friendlyNameToUse?: string,
    isPublic = false,
  ): Promise<TestTownData> {
    const friendlyName =
      friendlyNameToUse !== undefined
        ? friendlyNameToUse
        : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await controller.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
      mapFile: 'testData/indoors.json',
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      townID: ret.townID,
      townUpdatePassword: ret.townUpdatePassword,
    };
  }
  function getBroadcastEmitterForTownID(townID: string) {
    const ret = createdTownEmitters.get(townID);
    if (!ret) {
      throw new Error(`Could not find broadcast emitter for ${townID}`);
    }
    return ret;
  }

  beforeAll(() => {
    // Set the twilio tokens to dummy values so that the unit tests can run
    process.env.TWILIO_API_AUTH_TOKEN = 'testing';
    process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
    process.env.TWILIO_API_KEY_SID = 'testing';
    process.env.TWILIO_API_KEY_SECRET = 'testing';
  });

  beforeEach(async () => {
    createdTownEmitters.clear();
    broadcastEmitter.mockImplementation((townID: string) => {
      const mockRoomEmitter = mockDeep<TownEmitter>();
      createdTownEmitters.set(townID, mockRoomEmitter);
      return mockRoomEmitter;
    });
    TownsStore.initializeTownsStore(broadcastEmitter);
    controller = new TownsController();
  });
  describe('createTown', () => {
    it('Allows for multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown.townID).not.toBe(secondTown.townID);
    });
    it('Prohibits a blank friendlyName', async () => {
      await expect(createTownForTesting('')).rejects.toThrowError();
    });
  });

  describe('listTowns', () => {
    it('Lists public towns, but not private towns', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const pubTown2 = await createTownForTesting(undefined, true);
      const privTown2 = await createTownForTesting(undefined, false);

      const towns = await controller.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
    it('Allows for multiple towns with the same friendlyName', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
      const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
      const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);

      const towns = await controller.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
  });

  describe('deleteTown', () => {
    it('Throws an error if the password is invalid', async () => {
      const { townID } = await createTownForTesting(undefined, true);
      await expect(controller.deleteTown(townID, nanoid())).rejects.toThrowError();
    });
    it('Throws an error if the townID is invalid', async () => {
      const { townUpdatePassword } = await createTownForTesting(undefined, true);
      await expect(controller.deleteTown(nanoid(), townUpdatePassword)).rejects.toThrowError();
    });
    it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
      const { townID, townUpdatePassword } = await createTownForTesting(undefined, true);
      await controller.deleteTown(townID, townUpdatePassword);

      const { socket } = mockPlayer(townID);
      await controller.joinTown(socket);
      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.disconnect).toHaveBeenCalled();

      const listedTowns = await controller.listTowns();
      if (listedTowns.find(r => r.townID === townID)) {
        fail('Expected the deleted town to no longer be listed');
      }
    });
    it('Informs all players when a town is destroyed using the broadcast emitter and then disconnects them', async () => {
      const town = await createTownForTesting();
      const players = await Promise.all(
        [...Array(10)].map(async () => {
          const player = mockPlayer(town.townID);
          await controller.joinTown(player.socket);
          return player;
        }),
      );
      const townEmitter = getBroadcastEmitterForTownID(town.townID);
      await controller.deleteTown(town.townID, town.townUpdatePassword);
      getLastEmittedEvent(townEmitter, 'townClosing');
      // extractLastCallToEmit will throw an error if no townClosing was emitted

      players.forEach(eachPlayer => expect(eachPlayer.socket.disconnect).toBeCalledWith(true));
    });
  });
  describe('updateTown', () => {
    it('Checks the password before updating any values', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await controller.listTowns(), pubTown1);
      await expect(
        controller.updateTown(pubTown1.townID, `${pubTown1.townUpdatePassword}*`, {
          friendlyName: 'broken',
          isPubliclyListed: false,
        }),
      ).rejects.toThrowError();

      // Make sure name or vis didn't change
      expectTownListMatches(await controller.listTowns(), pubTown1);
    });
    it('Updates the friendlyName and visbility as requested', async () => {
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await controller.listTowns(), pubTown1);
      await controller.updateTown(pubTown1.townID, pubTown1.townUpdatePassword, {
        friendlyName: 'newName',
        isPubliclyListed: true,
      });
      pubTown1.friendlyName = 'newName';
      pubTown1.isPubliclyListed = true;
      expectTownListMatches(await controller.listTowns(), pubTown1);
    });
    it('Should fail if the townID does not exist', async () => {
      await expect(
        controller.updateTown(nanoid(), nanoid(), { friendlyName: 'test', isPubliclyListed: true }),
      ).rejects.toThrow();
    });
  });

  describe('joinTown', () => {
    it('Disconnects the socket if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      const { socket } = mockPlayer(nanoid());
      await controller.joinTown(socket);
      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.disconnect).toHaveBeenCalled();
    });
    it('Admits a user to a valid public or private town and sends back initial data', async () => {
      const joinAndCheckInitialData = async (publiclyListed: boolean) => {
        const town = await createTownForTesting(undefined, publiclyListed);
        const player = mockPlayer(town.townID);
        await controller.joinTown(player.socket);
        expect(player.socket.emit).toHaveBeenCalled();
        expect(player.socket.disconnect).not.toHaveBeenCalled();

        const initialData = getLastEmittedEvent(player.socket, 'initialize');

        expect(initialData.friendlyName).toEqual(town.friendlyName);
        expect(initialData.isPubliclyListed).toEqual(publiclyListed);
        expect(initialData.interactables.length).toBeGreaterThan(0);
        expect(initialData.providerVideoToken).toBeDefined();
        expect(initialData.sessionToken).toBeDefined();
        expect(initialData.currentPlayers.length).toBe(1);
        expect(initialData.currentPlayers[0].userName).toEqual(player.userName);
        expect(initialData.currentPlayers[0].id).toEqual(initialData.userID);
      };
      await joinAndCheckInitialData(true);
      await joinAndCheckInitialData(false);
    });
    it('Includes active conversation areas in the initial join data', async () => {
      const town = await createTownForTesting(undefined, true);
      const player = mockPlayer(town.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      const conversationArea = createConversationForTesting({
        boundingBox: { x: 10, y: 10, width: 1, height: 1 },
        conversationID: initialData.interactables.find(
          eachInteractable => 'occupantsByID' in eachInteractable,
        )?.id,
      });
      await controller.createConversationArea(
        town.townID,
        extractSessionToken(player),
        conversationArea,
      );

      const player2 = mockPlayer(town.townID);
      await controller.joinTown(player2.socket);
      const initialData2 = getLastEmittedEvent(player2.socket, 'initialize');
      const createdArea = initialData2.interactables.find(
        eachInteractable => eachInteractable.id === conversationArea.id,
      ) as ConversationArea;
      expect(createdArea.topic).toEqual(conversationArea.topic);
      expect(initialData2.interactables.length).toEqual(initialData.interactables.length);
    });
  });
  describe('Interactables', () => {
    let testingTown: TestTownData;
    let player: MockedPlayer;
    let sessionToken: string;
    let interactables: Interactable[];
    beforeEach(async () => {
      testingTown = await createTownForTesting(undefined, true);
      player = mockPlayer(testingTown.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      sessionToken = initialData.sessionToken;
      interactables = initialData.interactables;
    });

    describe('Create Conversation Area', () => {
      it('Executes without error when creating a new conversation', async () => {
        await controller.createConversationArea(
          testingTown.townID,
          sessionToken,
          createConversationForTesting({
            conversationID: interactables.find(isConversationArea)?.id,
          }),
        );
      });
      it('Returns an error message if the town ID is invalid', async () => {
        await expect(
          controller.createConversationArea(nanoid(), sessionToken, createConversationForTesting()),
        ).rejects.toThrow();
      });
      it('Checks for a valid session token before creating a conversation area', async () => {
        const conversationArea = createConversationForTesting();
        const invalidSessionToken = nanoid();

        await expect(
          controller.createConversationArea(
            testingTown.townID,
            invalidSessionToken,
            conversationArea,
          ),
        ).rejects.toThrow();
      });
      it('Returns an error message if addConversation returns false', async () => {
        const conversationArea = createConversationForTesting();
        await expect(
          controller.createConversationArea(testingTown.townID, sessionToken, conversationArea),
        ).rejects.toThrow();
      });
    });
    describe('Create Carnival Game Area', () => {
      it('Executes without error when creating a new carnival game area', async () => {
        const carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameArea;
        if (!carnivalGameArea) {
          fail('Expected at least one carnival game area to be returned in the initial join data');
        } else {
          const newCarnivalGameArea: CarnivalGameArea = {
            id: carnivalGameArea.id,
            petRule: [
              {
                percentileRangeMin: 0,
                percentileRangeMax: 10,
                petSelection: [],
              },
            ],
          };
          await controller.createCarnivalGameArea(
            testingTown.townID,
            sessionToken,
            newCarnivalGameArea,
          );
          const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
          const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
          if (isCarnivalGameArea(updateMessage)) {
            expect(updateMessage).toEqual(newCarnivalGameArea);
          } else {
            fail('Expected an interactableUpdate to be dispatched with the new carnival game area');
          }
        }
      });
      it('Returns an error message if the town ID is invalid', async () => {
        const carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameArea;
        const newCarnivalGameArea: CarnivalGameArea = {
          id: carnivalGameArea.id,
          petRule: [
            {
              percentileRangeMin: 0,
              percentileRangeMax: 10,
              petSelection: [],
            },
          ],
        };
        await expect(
          controller.createCarnivalGameArea(nanoid(), sessionToken, newCarnivalGameArea),
        ).rejects.toThrow();
      });

      it('Checks for a valid session token before creating a carnival game area', async () => {
        const invalidSessionToken = nanoid();
        const carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameArea;
        const newCarnivalGameArea: CarnivalGameArea = {
          id: carnivalGameArea.id,
          petRule: [
            {
              percentileRangeMin: 0,
              percentileRangeMax: 10,
              petSelection: [],
            },
          ],
        };
        await expect(
          controller.createCarnivalGameArea(nanoid(), invalidSessionToken, newCarnivalGameArea),
        ).rejects.toThrow();
      });
      it('Returns an error message if addCarnivalGameArea returns false', async () => {
        const carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameArea;
        carnivalGameArea.id = nanoid();
        await expect(
          controller.createCarnivalGameArea(testingTown.townID, sessionToken, carnivalGameArea),
        ).rejects.toThrow();
      });

      it('Modify the CarnivalGameArea if a new petRule is created', async () => {
        const carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameArea;
        if (!carnivalGameArea) {
          fail('Expected at least one carnival game area to be returned in the initial join data');
        } else {
          const newCarnivalGameArea: CarnivalGameArea = {
            id: carnivalGameArea.id,
            petRule: [
              {
                percentileRangeMin: 0,
                percentileRangeMax: 10,
                petSelection: [],
              },
            ],
          };
          await controller.createCarnivalGameArea(
            testingTown.townID,
            sessionToken,
            newCarnivalGameArea,
          );
          const addPetRule: PetRule = {
            percentileRangeMax: 20,
            percentileRangeMin: 10,
            petSelection: [],
          };
          const petRule = await controller.changePetRule(
            testingTown.townID,
            newCarnivalGameArea.id,
            addPetRule,
            sessionToken,
          );
          expect(petRule.length).toEqual(2);
        }
      });
    });

    describe('[T1] Create Viewing Area', () => {
      it('Executes without error when creating a new viewing area', async () => {
        const viewingArea = interactables.find(isViewingArea) as ViewingArea;
        if (!viewingArea) {
          fail('Expected at least one viewing area to be returned in the initial join data');
        } else {
          const newViewingArea: ViewingArea = {
            elapsedTimeSec: 100,
            id: viewingArea.id,
            video: nanoid(),
            isPlaying: true,
          };
          await controller.createViewingArea(testingTown.townID, sessionToken, newViewingArea);
          // Check to see that the viewing area was successfully updated
          const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
          const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
          if (isViewingArea(updateMessage)) {
            expect(updateMessage).toEqual(newViewingArea);
          } else {
            fail('Expected an interactableUpdate to be dispatched with the new viewing area');
          }
        }
      });
      it('Returns an error message if the town ID is invalid', async () => {
        const viewingArea = interactables.find(isViewingArea) as ViewingArea;
        const newViewingArea: ViewingArea = {
          elapsedTimeSec: 100,
          id: viewingArea.id,
          video: nanoid(),
          isPlaying: true,
        };
        await expect(
          controller.createViewingArea(nanoid(), sessionToken, newViewingArea),
        ).rejects.toThrow();
      });
      it('Checks for a valid session token before creating a viewing area', async () => {
        const invalidSessionToken = nanoid();
        const viewingArea = interactables.find(isViewingArea) as ViewingArea;
        const newViewingArea: ViewingArea = {
          elapsedTimeSec: 100,
          id: viewingArea.id,
          video: nanoid(),
          isPlaying: true,
        };
        await expect(
          controller.createViewingArea(testingTown.townID, invalidSessionToken, newViewingArea),
        ).rejects.toThrow();
      });
      it('Returns an error message if addViewingArea returns false', async () => {
        const viewingArea = interactables.find(isViewingArea) as ViewingArea;
        viewingArea.id = nanoid();
        await expect(
          controller.createViewingArea(testingTown.townID, sessionToken, viewingArea),
        ).rejects.toThrow();
      });
    });
    describe('Scoreboard Controller tests', () => {
      it('getAllScores test for empty scoreboard', async () => {
        const testAreaController = new TownsController();
        const getAllScores = await testAreaController.getAllScores();
        expect(getAllScores).toEqual([]);
      });
      it('getTopX test for empty scoreboard', async () => {
        const testAreaController = new TownsController();
        const getXScores = await testAreaController.getXScores(5);
        expect(getXScores).toEqual([]);
      });
      it('calculatedPercentile test with input of 0 for empty scoreboard', async () => {
        const testAreaController = new TownsController();
        const getPercentile = await testAreaController.getPercentile(0);
        expect(getPercentile).toEqual(0);
      });
      it('calculatedPercentile test with input of a positive number for empty scoreboard', async () => {
        const testAreaController = new TownsController();
        const getPercentile = await testAreaController.getPercentile(8);
        expect(getPercentile).toEqual(0);
      });
      it('calculatedPercentile test with input of a negative number for empty scoreboard', async () => {
        const testAreaController = new TownsController();
        const getPercentile = await testAreaController.getPercentile(-8);
        expect(getPercentile).toEqual(0);
      });
      it('adding a player score tuple - test with getXScores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        const newPlayerScoreTuple = { player: newPlayer.toPlayerModel(), score: 30 };
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        const listOfExpectedScores = await testAreaController.getXScores(5);
        expect(listOfExpectedScores).toEqual([newPlayerScoreTuple]);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
      it('adding a player score tuple - test with getAllScores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        const newPlayerScoreTuple = { player: newPlayer.toPlayerModel(), score: 30 };
        const expectedlist = [newPlayerScoreTuple];
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        const allScores = await testAreaController.getAllScores();
        expect(allScores).toEqual(expectedlist);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
      it('removing a player score tuple', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
        const allScores = await testAreaController.getAllScores();
        expect(allScores).toEqual([]);
      });
      it('removing a player that has multiple scores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
        const getAllScores = await testAreaController.getAllScores();
        expect(getAllScores).toEqual([]);
      });
      it('removing a player that when there are multiple players', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
        const newPlayerScoreTuple = { player: newPlayer2.toPlayerModel(), score: 40 };
        const expectedList = [newPlayerScoreTuple];
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
        await testAreaController.addPlayerScore(newPlayer2.toPlayerModel(), 40);
        const getAllScores = await testAreaController.getAllScores();
        expect(getAllScores).toEqual(expectedList);
        await testAreaController.removePlayer(newPlayer2.toPlayerModel());
      });
      it('getting a percentile for score higher than all scores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        const getPercentile = await testAreaController.getPercentile(40);
        expect(getPercentile).toEqual(0);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
      it('getting a percentile for a score equal to highest score', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        const getPercentile = await testAreaController.getPercentile(37);
        expect(getPercentile).toEqual(0);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
      it('getting a percentile for a score between 2 different scores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        const getPercentile = await testAreaController.getPercentile(33);
        expect(getPercentile).toEqual(0.5);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
      it('getting a percentile for a score lower than all scores', async () => {
        const testAreaController = new TownsController();
        const newPlayer = new Player(nanoid(), mock<TownEmitter>());
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 30);
        await testAreaController.addPlayerScore(newPlayer.toPlayerModel(), 37);
        const getPercentile = await testAreaController.getPercentile(28);
        expect(getPercentile).toEqual(1);
        await testAreaController.removePlayer(newPlayer.toPlayerModel());
      });
    });
  });
});

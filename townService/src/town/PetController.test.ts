import { nanoid } from 'nanoid';
import { DeepMockProxy, mockDeep, mock } from 'jest-mock-extended';
import {
  CarnivalGameArea as CarnivalGameAreaModel,
  Interactable,
  TownEmitter,
} from '../types/CoveyTownSocket';
import { TownsController } from './TownsController';
import TownsStore from '../lib/TownsStore';
import { getLastEmittedEvent, mockPlayer, MockedPlayer, isCarnivalGameArea } from '../TestUtils';
import CarnivalGameArea from './CarnivalGameArea';
import Player from '../lib/Player';

type TestTownData = {
  friendlyName: string;
  townID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};
const broadcastEmitter = jest.fn();

describe('PetController integration tests', () => {
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

  describe('Pet', () => {
    let testingTown: TestTownData;
    let player: MockedPlayer;
    let sessionToken: string;
    let interactables: Interactable[];
    let carnivalGameArea: CarnivalGameAreaModel;

    beforeEach(async () => {
      testingTown = await createTownForTesting(undefined, true);
      player = mockPlayer(testingTown.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      sessionToken = initialData.sessionToken;
      interactables = initialData.interactables;
      player.player = new Player(nanoid(), mock<TownEmitter>());
      player.moveTo(2945, 1030);
      carnivalGameArea = interactables.find(isCarnivalGameArea) as CarnivalGameAreaModel;
      carnivalGameArea.petRule = [
        {
          percentileRangeMax: 100,
          percentileRangeMin: 0,
          petSelection: [
            {
              id: nanoid(),
              name: nanoid(),
              movementType: 'offsetPlayer',
              species: 'dog',
              x: 0,
              y: 0,
            },
          ],
        },
      ];
      if (!carnivalGameArea) {
        fail('Expected at least one carnival game area to be return in the intial join data');
      } else {
        await controller.createCarnivalGameArea(testingTown.townID, sessionToken, carnivalGameArea);
      }
    });

    describe('Pet and CarnivalGameArea', () => {
      it('Assign Pet to Player', async () => {
        const pet = await controller.assignPet(
          testingTown.townID,
          carnivalGameArea.id,
          'lemmy',
          sessionToken,
        );
        expect(pet).toBeUndefined();
      });
    });
  });
});

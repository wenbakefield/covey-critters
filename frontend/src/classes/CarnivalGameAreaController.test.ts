import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PetRule } from '../types/CoveyTownSocket';
import CarnivalGameAreaController, { CarnivalGameAreaEvents } from './CarnivalGameAreaController';
import SpaceBarGameController from './SBGameController';

describe('[T2] CarnivalGameControllerArea', () => {
  let testArea: CarnivalGameAreaController;
  const mockListeners = mock<CarnivalGameAreaEvents>();
  beforeEach(() => {
    testArea = new CarnivalGameAreaController({ id: nanoid(), petRule: [] });
    mockClear(mockListeners.petRuleChange);
    testArea.addListener('petRuleChange', mockListeners.petRuleChange);
  });

  describe('Add/Remove and Retrieving GameSession From CarnivalGameArea', () => {
    let spaceBarGame: SpaceBarGameController;
    beforeEach(() => {
      spaceBarGame = new SpaceBarGameController(nanoid(), 100, 100);
    });

    it('New Game is added to the carnivalGameArea', () => {
      testArea.addGameSession(spaceBarGame);
      expect(testArea.getGameSessionByID(spaceBarGame.player)).toBeDefined();
    });

    it('Remove game from CarnivalGameArea', () => {
      testArea.addGameSession(spaceBarGame);
      testArea.removeGameSession(spaceBarGame.player);
      expect(testArea.getGameSessionByID(spaceBarGame.player)).not.toBeDefined();
    });

    it('Duplicate Game cannot be added for the same player', () => {
      const duplicateGame = new SpaceBarGameController(spaceBarGame.player, 50, 100);
      testArea.addGameSession(spaceBarGame);
      testArea.addGameSession(duplicateGame);
      expect(testArea.getGameSessionByID(spaceBarGame.player)).toEqual(duplicateGame);
    });
  });

  describe('get carnivalGameAreaModel', () => {
    it('Retrieve Carnival Game with Empty petRule', () => {
      expect(testArea.carnivalGameAreaModel()).toEqual({ id: testArea.id, petRule: [] });
    });

    it('Retrieve Carnival Game with Empty petRule', () => {
      const newPetRule: PetRule[] = [
        {
          percentileRangeMin: 0,
          percentileRangeMax: 100,
          petSelection: [
            {
              id: nanoid(),
              name: 'lemmy',
              species: 'brown-cobra',
              movementType: 'orbitalPlayer',
              x: 0,
              y: 0,
            },
          ],
        },
      ];
      testArea.petRule = newPetRule;
      expect(testArea.carnivalGameAreaModel()).toEqual({ id: testArea.id, petRule: newPetRule });
    });
  });
});

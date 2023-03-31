import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GameSession } from '../types/CoveyTownSocket';
import SpaceBarGameController, { SpaceBarGameEvents } from './SBGameController';

describe('[T2] SpaceBarGame Controller', () => {
  let testController: SpaceBarGameController;
  const mockListeners = mock<SpaceBarGameEvents>();
  beforeEach(() => {
    mockClear(mockListeners);
    testController = new SpaceBarGameController(nanoid(), 100, 100);
    testController.addListener('gameChanged', mockListeners.gameChanged);
    testController.addListener('gameTimeOut', mockListeners.gameTimeOut);
  });

  it('Update the SpaceBarGame through setter', () => {
    testController.score = 50;
    testController.isOver = true;
    const spaceBarGame: GameSession = {
      playerId: testController.player,
      score: 50,
      scoreLimit: 100,
      isOver: true,
      timeLimit: 100,
    };

    expect(testController.toModel()).toEqual(spaceBarGame);
    expect(mockListeners.gameChanged).toBeCalled();
    expect(mockListeners.gameTimeOut).toBeCalled();
  });

  it('Update the SpaceBarGame through updateFrom', () => {
    const spaceBarGame: GameSession = {
      playerId: testController.player,
      score: 50,
      scoreLimit: 100,
      isOver: true,
      timeLimit: 100,
    };
    testController.updateFrom(spaceBarGame);
    expect(testController.toModel()).toEqual(spaceBarGame);
    expect(mockListeners.gameChanged).toBeCalled();
    expect(mockListeners.gameTimeOut).toBeCalled();
  });
  it('Does not emit the gameTimeOut event when game is not over', () => {
    const spaceBarGame: GameSession = {
      playerId: testController.player,
      score: 50,
      scoreLimit: 100,
      isOver: false,
      timeLimit: 100,
    };
    testController.updateFrom(spaceBarGame);
    expect(testController.toModel()).toEqual(spaceBarGame);
    expect(mockListeners.gameChanged).toBeCalled();
    expect(mockListeners.gameTimeOut).not.toBeCalled();
  });
});

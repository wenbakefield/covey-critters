import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import ScoreboardController, { ScoreBoardEvents } from './ScoreboardController';
import { Player as PlayerModel, PlayerLocation, PlayerScoreTuple } from '../types/CoveyTownSocket';

describe('[T2] ScoreboardController', () => {
  let testArea: ScoreboardController;
  const mockListeners = mock<ScoreBoardEvents>();
  const playerLocation: PlayerLocation = {
    moving: false,
    x: 0,
    y: 0,
    rotation: 'front',
  };
  beforeEach(() => {
    testArea = new ScoreboardController([]);
    mockClear(mockListeners.scoreboardChange);
    testArea.addListener('scoreboardChange', mockListeners.scoreboardChange);
  });
  describe('empty Scoreboard test', () => {
    it('Get returns empty list for empty scoreboard', () => {
      expect(testArea.scoreboard).toStrictEqual([]);
    });
    it('GetXScores returns empty list for empty scoreboard', () => {
      expect(testArea.getXScores(5)).toStrictEqual([]);
    });
    it('testing add method', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayerScoreTuple = { player: newPlayer, score: 3 };
      testArea.addPlayerScore(newPlayer, 3);
      expect(testArea.getXScores(5)).toStrictEqual([newPlayerScoreTuple]);
    });
  });
});

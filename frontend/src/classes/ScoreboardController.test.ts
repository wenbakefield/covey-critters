import { mock, mockClear } from 'jest-mock-extended';
import ScoreboardController, { ScoreBoardEvents } from './ScoreboardController';
import { PlayerLocation, Player, PlayerScoreTuple } from '../types/CoveyTownSocket';
import { nanoid } from 'nanoid';

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
  describe('Scoreboard tests for get and set functionality', () => {
    it('Get returns empty list for empty scoreboard', () => {
      expect(testArea.scoreboard).toStrictEqual([]);
    });
    it('set a scoreboard and get new version', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const playerScoreTupleList: PlayerScoreTuple[] = [{ player: newPlayer, score: 30 }];
      testArea.scoreboard = playerScoreTupleList;
      expect(testArea.scoreboard).toStrictEqual(playerScoreTupleList);
      expect(mockListeners.scoreboardChange).toBeCalled();
      expect(mockListeners.scoreboardChange).toBeCalledWith(playerScoreTupleList);
      testArea.scoreboard = [];
      expect(testArea.scoreboard).toStrictEqual([]);
      expect(mockListeners.scoreboardChange).toBeCalled();
      expect(mockListeners.scoreboardChange).toBeCalledWith([]);
    });
  });
});

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

    it('return the highest score for the given player if scoredboard is empty', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      expect(testArea.getHighestScoreByPlayer(newPlayer.id)).toEqual(NaN);
    });

    it('return the highest score for the given player', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const playerScoreTupleList: PlayerScoreTuple[] = [{ player: newPlayer, score: 30 }];
      testArea.scoreboard = playerScoreTupleList;
      expect(testArea.getHighestScoreByPlayer(newPlayer.id)).toEqual(30);
    });

    it('return the highest score for the given player', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const playerScoreTupleList: PlayerScoreTuple[] = [
        { player: newPlayer, score: 60 },
        { player: newPlayer, score: 30 },
      ];
      testArea.scoreboard = playerScoreTupleList;
      expect(testArea.getHighestScoreByPlayer(newPlayer.id)).toEqual(60);
    });

    it('return the highest rank for the given player if scoredboard is empty', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      expect(testArea.getRankByPlayer(newPlayer.id)).toEqual(NaN);
    });

    it('return the highest rank for the given player', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const playerScoreTupleList: PlayerScoreTuple[] = [{ player: newPlayer, score: 30 }];
      testArea.scoreboard = playerScoreTupleList;
      expect(testArea.getRankByPlayer(newPlayer.id)).toEqual(1);
    });

    it('return the highest score for the given player', () => {
      const newPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const secondPlayer: Player = { id: nanoid(), userName: 'username', location: playerLocation };
      const playerScoreTupleList: PlayerScoreTuple[] = [
        { player: secondPlayer, score: 60 },
        { player: newPlayer, score: 30 },
      ];
      testArea.scoreboard = playerScoreTupleList;
      expect(testArea.getRankByPlayer(newPlayer.id)).toEqual(2);
    });
  });
});

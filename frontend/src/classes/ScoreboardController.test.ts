import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import ScoreboardController, { ScoreBoardEvents } from './ScoreboardController';
import { PlayerLocation } from '../types/CoveyTownSocket';

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
  describe('Scoreboard tests for get functionality', () => {
    it('Get returns empty list for empty scoreboard', () => {
      expect(testArea.scoreboard).toStrictEqual([]);
    });
    it('GetXScores returns empty list for empty scoreboard', () => {
      expect(testArea.getXScores(5)).toStrictEqual([]);
    });
  });
  describe('Scoreboard tests for add and remove functionality', () => {
    it('Set scoreboard test: to add players on an empty scoreboard', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer1ScoreTuple];
      testArea.scoreboard = expectedScoreboard;
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('Set scoreboard test: to set same number of players on an non-empty scoreboard', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const expectedScoreboard = [newPlayer2ScoreTuple];
      testArea.scoreboard = expectedScoreboard;
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('Set scoreboard test: to set different number of players on an non-empty scoreboard', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3ScoreTuple = { player: newPlayer3, score: 1 };
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer3ScoreTuple];
      testArea.scoreboard = expectedScoreboard;
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('Set scoreboard test: set with a player appearing multiple times', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const newPlayer2ScoreTuple2 = { player: newPlayer2, score: 1 };
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer2ScoreTuple2];
      testArea.scoreboard = expectedScoreboard;
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('Set scoreboard test: to set same set of players as existing ones', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer2, 7);
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer1ScoreTuple];
      testArea.scoreboard = expectedScoreboard;
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing addPlayerScore method to add 1 player', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer, 3);
      const newPlayerScoreTuple = { player: newPlayer, score: 3 };
      expect(testArea.scoreboard).toStrictEqual([newPlayerScoreTuple]);
      expect(mockListeners.scoreboardChange).toBeCalledWith([newPlayerScoreTuple]);
    });
    it('testing addPlayerScore method to addding a player with different scores', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer, 3);
      testArea.addPlayerScore(newPlayer, 5);
      const newPlayerScoreTuple = { player: newPlayer, score: 3 };
      const newPlayerScoreTuple2 = { player: newPlayer, score: 5 };
      const expectedScoreboard = [newPlayerScoreTuple2, newPlayerScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing addPlayerScore method to add 2 players - lesser score first', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer1ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing addPlayerScore method to add 2 players - higher score first', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer1ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing removePlayer method to remove 1 player to get empty scoreboard', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer, 3);
      testArea.removePlayer(newPlayer);
      expect(testArea.scoreboard).toStrictEqual([]);
      expect(mockListeners.scoreboardChange).toBeCalledWith([]);
    });
    it('testing removePlayer method to remove the only player with different scores', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer, 3);
      testArea.addPlayerScore(newPlayer, 5);
      testArea.removePlayer(newPlayer);
      expect(testArea.scoreboard).toStrictEqual([]);
      expect(mockListeners.scoreboardChange).toBeCalledWith([]);
    });
    it('testing removePlayer method to remove a player with different scores', () => {
      const newPlayer = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer, 3);
      testArea.addPlayerScore(newPlayer, 5);
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.removePlayer(newPlayer);
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const expectedScoreboard = [newPlayer2ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing removePlayer method remove 1 player from middle of the board', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer3, 1);
      const newPlayer3ScoreTuple = { player: newPlayer3, score: 1 };
      testArea.removePlayer(newPlayer1);
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer3ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing removePlayer method remove 1 player from top of the board', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer3, 1);
      const newPlayer3ScoreTuple = { player: newPlayer3, score: 1 };
      testArea.removePlayer(newPlayer2);
      const expectedScoreboard = [newPlayer1ScoreTuple, newPlayer3ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
    it('testing removePlayer method remove 1 player from bottom of the board', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer1, 3);
      const newPlayer1ScoreTuple = { player: newPlayer1, score: 3 };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      const newPlayer2ScoreTuple = { player: newPlayer2, score: 7 };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer3, 1);
      testArea.removePlayer(newPlayer3);
      const expectedScoreboard = [newPlayer2ScoreTuple, newPlayer1ScoreTuple];
      expect(testArea.scoreboard).toStrictEqual(expectedScoreboard);
      expect(mockListeners.scoreboardChange).toBeCalledWith(expectedScoreboard);
    });
  });
  describe('Scoreboard tests for getting percentile', () => {
    it('testing getPercentile on an empty scoreboard', () => {
      expect(testArea.getPercentile(5)).toStrictEqual(0);
    });
    it('testing getPercentile for a score higher than current ones', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer3, 10);
      expect(testArea.getPercentile(12)).toStrictEqual(0);
    });
    it('testing getPercentile for a score lower than current ones', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer3, 10);
      expect(testArea.getPercentile(1)).toStrictEqual(1);
    });
    it('testing getPercentile for a score middle of all scores', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer3, 10);
      testArea.addPlayerScore(newPlayer3, 15);
      expect(testArea.getPercentile(9)).toStrictEqual(0.5);
    });
    it('testing getPercentile for a better than 75%', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer3, 10);
      testArea.addPlayerScore(newPlayer3, 15);
      expect(testArea.getPercentile(13)).toStrictEqual(0.25);
    });
    it('testing getPercentile for a worse than 75%', () => {
      const newPlayer1 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer2 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      const newPlayer3 = { id: nanoid(), userName: nanoid(), location: playerLocation };
      testArea.addPlayerScore(newPlayer2, 7);
      testArea.addPlayerScore(newPlayer1, 3);
      testArea.addPlayerScore(newPlayer3, 10);
      testArea.addPlayerScore(newPlayer3, 15);
      expect(testArea.getPercentile(5)).toStrictEqual(0.75);
    });
  });
});

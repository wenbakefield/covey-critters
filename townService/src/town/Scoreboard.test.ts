import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import { TownEmitter, PlayerScoreTuple, Player as PlayerModel } from '../types/CoveyTownSocket';
import SingletonScoreboardFactory from '../lib/SingletonScoreboardFactory';
import Player from '../lib/Player';

describe('Scoreboard tests', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  beforeEach(() => {
    scoreboard1.getAllScores().forEach(playerScoreTuple => {
      scoreboard1.removePlayerScore(playerScoreTuple.player);
    });
  });
  describe('Empty scoreboard tests for get scores functionality and percentile of a score input', () => {
    it('get top 0 elements in empty scoreboard', () => {
      expect(scoreboard1.getTopX(0)).toEqual([]);
    });

    it('get top negative number of elements in empty scoreboard', () => {
      expect(scoreboard1.getTopX(-8)).toEqual([]);
    });

    it('test for get all scores', () => {
      expect(scoreboard1.getAllScores()).toEqual([]);
    });

    it('get calculatedPercentile of 0 in empty scoreboard', () => {
      expect(scoreboard1.calculatedPercentile(0)).toBe(0);
    });

    it('get calculatedPercentile of a negative number in empty scoreboard', () => {
      expect(scoreboard1.calculatedPercentile(-8)).toBe(0);
    });
  });
  describe('Tests for adding and removing scores from scoreboard functionality and effects on get', () => {
    it('add 1 player-score tuple and get the list', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPair: PlayerScoreTuple = { player: newPlayer.toPlayerModel(), score: 20 };
      expect(scoreboard1.getTopX(1)).toEqual([newPair]);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
    });

    it('notifyScoreBoard for same player playing twice to check scoreboard', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const expectedScoreBoardValue = [
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer.toPlayerModel(), score: 20 },
      ];
      expect(scoreboard1.getTopX(2)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
    });

    it('notifyScoreBoard for same player playing twice and an additional player playing', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer1 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer1.toPlayerModel(), 8);
      const expectedScoreBoardValue = [
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer.toPlayerModel(), score: 20 },
        { player: newPlayer1.toPlayerModel(), score: 8 },
      ];
      expect(scoreboard1.getTopX(3)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer1.toPlayerModel());
    });

    it('add 3 player-score tuples in increasing order and get the list', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
      const expectedScoreBoardValue = [
        { player: newPlayer3.toPlayerModel(), score: 30 },
        { player: newPlayer2.toPlayerModel(), score: 25 },
        { player: newPlayer.toPlayerModel(), score: 20 },
      ];
      expect(scoreboard1.getTopX(3)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('add 3 player-score tuples in decreasing order and get the list', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
      const expectedScoreBoardValue = [
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer2.toPlayerModel(), score: 20 },
        { player: newPlayer3.toPlayerModel(), score: 15 },
      ];
      expect(scoreboard1.getTopX(3)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('add 3 player-score tuples and use getTopX with a higher value than number of player-score tuples', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
      const expectedScoreBoardValue = [
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer2.toPlayerModel(), score: 20 },
        { player: newPlayer3.toPlayerModel(), score: 15 },
      ];
      expect(scoreboard1.getTopX(5)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('get all of the scores in a scoreboard', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
      const expectedScoreBoardValue = [
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer2.toPlayerModel(), score: 20 },
        { player: newPlayer3.toPlayerModel(), score: 15 },
      ];
      expect(scoreboard1.getAllScores()).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('get all of the scores in an empty scoreboard', () => {
      expect(scoreboard1.getAllScores()).toEqual([]);
    });

    it('add 5 player-score tuples in random order and get the list', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 35);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 10);
      const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer4.toPlayerModel(), 50);
      const newPlayer5 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer5.toPlayerModel(), 2);
      const expectedScoreBoardValue = [
        { player: newPlayer4.toPlayerModel(), score: 50 },
        { player: newPlayer2.toPlayerModel(), score: 35 },
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer3.toPlayerModel(), score: 10 },
        { player: newPlayer5.toPlayerModel(), score: 2 },
      ];
      expect(scoreboard1.getTopX(5)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer4.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer5.toPlayerModel());
    });

    it('add player-scores and remove a player', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 35);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 10);
      const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer4.toPlayerModel(), 50);
      const newPlayer5 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer5.toPlayerModel(), 2);
      const expectedScoreBoardValue = [
        { player: newPlayer4.toPlayerModel(), score: 50 },
        { player: newPlayer.toPlayerModel(), score: 25 },
        { player: newPlayer3.toPlayerModel(), score: 10 },
        { player: newPlayer5.toPlayerModel(), score: 2 },
      ];
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      expect(scoreboard1.getTopX(5)).toEqual(expectedScoreBoardValue);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer4.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer5.toPlayerModel());
    });
  });
  describe('Tests for calculatedPercentile on a non-empty scoreboard', () => {
    it('add 3 player-score tuples and get calculatedPercentile of a score higher than all', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
      expect(scoreboard1.calculatedPercentile(40)).toEqual(0);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('add 3 player-score tuples and get calculatedPercentile of a score lower than all', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
      expect(scoreboard1.calculatedPercentile(4)).toEqual(1);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
    });

    it('add 3 player-score tuples and get calculatedPercentile between first and second', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
      const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer4.toPlayerModel(), 10);
      expect(scoreboard1.calculatedPercentile(27)).toEqual(0.25);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer4.toPlayerModel());
    });

    it('add 3 player-score tuples and get calculatedPercentile between last and second last', () => {
      const newPlayer = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
      const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
      const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
      const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
      scoreboard1.notifyScoreBoard(newPlayer4.toPlayerModel(), 10);
      expect(scoreboard1.calculatedPercentile(15)).toEqual(0.75);
      scoreboard1.removePlayerScore(newPlayer.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer3.toPlayerModel());
      scoreboard1.removePlayerScore(newPlayer4.toPlayerModel());
    });
  });
});

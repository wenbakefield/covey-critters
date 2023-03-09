import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { TownEmitter } from '../types/CoveyTownSocket';
import ScoreboardController from './ScoreboardController';

describe('Scoreboard Controller tests', () => {
  it('getAllScores test for empty scoreboard', () => {
    const testAreaController = new ScoreboardController();
    expect(testAreaController.getAllScores()).toStrictEqual([]);
  });
  it('getTopX test for empty scoreboard', () => {
    const testAreaController = new ScoreboardController();
    expect(testAreaController.getXScores(5)).toStrictEqual([]);
  });
  it('calculatedPercentile test with input of 0 for empty scoreboard', () => {
    const testAreaController = new ScoreboardController();
    expect(testAreaController.getPercentile(0)).toStrictEqual(0);
  });
  it('calculatedPercentile test with input of a positive number for empty scoreboard', () => {
    const testAreaController = new ScoreboardController();
    expect(testAreaController.getPercentile(8)).toStrictEqual(0);
  });
  it('calculatedPercentile test with input of a negative number for empty scoreboard', () => {
    const testAreaController = new ScoreboardController();
    expect(testAreaController.getPercentile(-8)).toStrictEqual(0);
  });
  it('adding a player score tuple - test with getXScores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    expect(testAreaController.getXScores(5)).toStrictEqual([[newPlayer, 30]]);
    testAreaController.removePlayer(newPlayer);
  });
  it('adding a player score tuple - test with getAllScores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    expect(testAreaController.getAllScores()).toStrictEqual([[newPlayer, 30]]);
    testAreaController.removePlayer(newPlayer);
  });
  it('removing a player score tuple', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.removePlayer(newPlayer);
    expect(testAreaController.getAllScores()).toStrictEqual([]);
  });
  it('removing a player that has multiple scores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    testAreaController.removePlayer(newPlayer);
    expect(testAreaController.getAllScores()).toStrictEqual([]);
  });
  it('removing a player that when there are multiple players', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    testAreaController.removePlayer(newPlayer);
    testAreaController.addPlayerScore(newPlayer2, 40);
    expect(testAreaController.getAllScores()).toStrictEqual([[newPlayer2, 40]]);
    testAreaController.removePlayer(newPlayer2);
  });
  it('getting a percentile for score higher than all scores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    expect(testAreaController.getPercentile(40)).toStrictEqual(0);
    testAreaController.removePlayer(newPlayer);
  });
  it('getting a percentile for a score equal to highest score', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    expect(testAreaController.getPercentile(37)).toStrictEqual(0);
    testAreaController.removePlayer(newPlayer);
  });
  it('getting a percentile for a score between 2 different scores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    expect(testAreaController.getPercentile(33)).toStrictEqual(0.5);
    testAreaController.removePlayer(newPlayer);
  });
  it('getting a percentile for a score lower than all scores', () => {
    const testAreaController = new ScoreboardController();
    const newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testAreaController.addPlayerScore(newPlayer, 30);
    testAreaController.addPlayerScore(newPlayer, 37);
    expect(testAreaController.getPercentile(28)).toStrictEqual(1);
    testAreaController.removePlayer(newPlayer);
  });
});

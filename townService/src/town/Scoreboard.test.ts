import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import { TownEmitter } from '../types/CoveyTownSocket';
import SingletonScoreboardFactory from './Scoreboard';
import Player from '../lib/Player';

test('get top 0 elements in empty scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  expect(scoreboard1.getTopX(0)).toStrictEqual([]);
});

test('get top negative number of elements in empty scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  expect(scoreboard1.getTopX(-8)).toStrictEqual([]);
});

test('get calculatedPercentile of 0 in empty scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  expect(scoreboard1.calculatedPercentile(0)).toBe(0);
});

test('get calculatedPercentile of a negative number in empty scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  expect(scoreboard1.calculatedPercentile(-8)).toBe(0);
});

test('add 1 player-score tuple and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
  expect(scoreboard1.getTopX(1)).toStrictEqual([[newPlayer.toPlayerModel(), 20]]);
});
test('add 3 player-score tuples in increasing order and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 30);
  const expectedScoreBoardValue = [
    [newPlayer3.toPlayerModel(), 30],
    [newPlayer2.toPlayerModel(), 25],
    [newPlayer.toPlayerModel(), 20],
  ];
  expect(scoreboard1.getTopX(3)).toStrictEqual(expectedScoreBoardValue);
});

test('add 3 player-score tuples in decreasing order and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
  const expectedScoreBoardValue = [
    [newPlayer.toPlayerModel(), 25],
    [newPlayer2.toPlayerModel(), 20],
    [newPlayer3.toPlayerModel(), 15],
  ];
  expect(scoreboard1.getTopX(3)).toStrictEqual(expectedScoreBoardValue);
});

test('add 3 player-score tuples and use getTopX with a higher value than number of player-score tuples', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
  const expectedScoreBoardValue = [
    [newPlayer.toPlayerModel(), 25],
    [newPlayer2.toPlayerModel(), 20],
    [newPlayer3.toPlayerModel(), 15],
  ];
  expect(scoreboard1.getTopX(5)).toStrictEqual(expectedScoreBoardValue);
});

test('get all of the scores in a scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer.toPlayerModel(), 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2.toPlayerModel(), 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3.toPlayerModel(), 15);
  const expectedScoreBoardValue = [
    [newPlayer.toPlayerModel(), 25],
    [newPlayer2.toPlayerModel(), 20],
    [newPlayer3.toPlayerModel(), 15],
  ];
  expect(scoreboard1.getAllScores()).toStrictEqual(expectedScoreBoardValue);
});

test('get all of the scores in an empty scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  expect(scoreboard1.getAllScores()).toStrictEqual([]);
});

test('add 5 player-score tuples in random order and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
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
    [newPlayer4.toPlayerModel(), 50],
    [newPlayer2.toPlayerModel(), 35],
    [newPlayer.toPlayerModel(), 25],
    [newPlayer3.toPlayerModel(), 10],
    [newPlayer5.toPlayerModel(), 2],
  ];
  expect(scoreboard1.getTopX(5)).toStrictEqual(expectedScoreBoardValue);
});

test('add player-scores and remove a player', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
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
    [newPlayer4.toPlayerModel(), 50],
    [newPlayer.toPlayerModel(), 25],
    [newPlayer3.toPlayerModel(), 10],
    [newPlayer5.toPlayerModel(), 2],
  ];
  scoreboard1.removePlayerScore(newPlayer2.toPlayerModel());
  expect(scoreboard1.getTopX(5)).toStrictEqual(expectedScoreBoardValue);
});

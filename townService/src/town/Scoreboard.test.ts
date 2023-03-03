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

test('add 3 player-score tuples and get calculatedPercentile of a score higher than all', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 30);
  expect(scoreboard1.calculatedPercentile(40)).toStrictEqual(0);
});

test('add 3 player-score tuples and get calculatedPercentile of a score lower than all', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 30);
  expect(scoreboard1.calculatedPercentile(4)).toStrictEqual(1);
});

test('add 3 player-score tuples and get calculatedPercentile between first and second', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 30);
  const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer4, 10);
  expect(scoreboard1.calculatedPercentile(27)).toStrictEqual(0.25);
});

test('add 3 player-score tuples and get calculatedPercentile between last and second last', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 30);
  const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer4, 10);
  expect(scoreboard1.calculatedPercentile(15)).toStrictEqual(0.75);
});

test('add 1 player-score tuple and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  expect(scoreboard1.getTopX(1)).toStrictEqual([[newPlayer, 20]]);
});

test('notifyScoreBoard for same player playing twice', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const expectedScoreBoardValue = [
    [newPlayer, 25],
    [newPlayer, 20],
  ];
  expect(scoreboard1.getTopX(2)).toStrictEqual(expectedScoreBoardValue);
});

test('notifyScoreBoard for same player playing twice and an additional player playing', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer1 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer1, 8);
  const expectedScoreBoardValue = [
    [newPlayer, 25],
    [newPlayer, 20],
    [newPlayer1, 8],
  ];
  expect(scoreboard1.getTopX(3)).toStrictEqual(expectedScoreBoardValue);
});

test('add 3 player-score tuples in increasing order and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 20);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 25);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 30);
  const expectedScoreBoardValue = [
    [newPlayer3, 30],
    [newPlayer2, 25],
    [newPlayer, 20],
  ];
  expect(scoreboard1.getTopX(3)).toStrictEqual(expectedScoreBoardValue);
});

test('add 3 player-score tuples in decreasing order and get the list', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 15);
  const expectedScoreBoardValue = [
    [newPlayer, 25],
    [newPlayer2, 20],
    [newPlayer3, 15],
  ];
  expect(scoreboard1.getTopX(3)).toStrictEqual(expectedScoreBoardValue);
});

test('add 3 player-score tuples and use getTopX with a higher value than number of player-score tuples', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 15);
  const expectedScoreBoardValue = [
    [newPlayer, 25],
    [newPlayer2, 20],
    [newPlayer3, 15],
  ];
  expect(scoreboard1.getTopX(5)).toStrictEqual(expectedScoreBoardValue);
});

test('get all of the scores in a scoreboard', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 15);
  const expectedScoreBoardValue = [
    [newPlayer, 25],
    [newPlayer2, 20],
    [newPlayer3, 15],
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
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 35);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 10);
  const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer4, 50);
  const newPlayer5 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer5, 2);
  const expectedScoreBoardValue = [
    [newPlayer4, 50],
    [newPlayer2, 35],
    [newPlayer, 25],
    [newPlayer3, 10],
    [newPlayer5, 2],
  ];
  expect(scoreboard1.getTopX(5)).toStrictEqual(expectedScoreBoardValue);
});

test('add player-scores and remove a player', () => {
  const scoreboard1 = SingletonScoreboardFactory.instance();
  // const scoreboard2 = SingletonScoreboardFactory.instance();
  const newPlayer = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer, 25);
  const newPlayer2 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer2, 20);
  const newPlayer3 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer3, 15);
  const newPlayer4 = new Player(nanoid(), mock<TownEmitter>());
  scoreboard1.notifyScoreBoard(newPlayer4, 80);
  const listOfTuples = [
    [newPlayer4, 80],
    [newPlayer, 25],
    [newPlayer3, 15],
  ];
  scoreboard1.removePlayerScore(newPlayer2);
  expect(scoreboard1.getTopX(3)).toStrictEqual(listOfTuples);
});

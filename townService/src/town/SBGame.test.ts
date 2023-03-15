import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import { TownEmitter } from '../types/CoveyTownSocket';
import Player from '../lib/Player';
import SBGame from './SBGame';

describe('SBGame', () => {
  let newPlayer: Player;
  let testGame: SBGame;

  beforeEach(() => {
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testGame = new SBGame(newPlayer, 100, 60);
  });
  describe('isOver', () => {
    it('Checks if maxScore has been reached', () => {
      expect(testGame.isOver()).toEqual(false);
      for (let i = 0; i <= 100; i++) {
        testGame.onTick('32');
      }
      expect(testGame.isOver()).toEqual(true);
    });
    it('Checks if timer hits 0', () => {
      expect(testGame.isOver(false)).toEqual(false);
      // Run timer passed from the frontend
      expect(testGame.isOver(true)).toEqual(true);
    });
  });
  describe('getTimer', () => {
    it('Checks if correct time is returned', () => {});
  });
  describe('onTick and getScore', () => {
    it('Increments score if space bar is clicked and checks if score is updated', () => {
      testGame.onTick('32');
      expect(testGame.getScore()).toEqual(1);
    });
  });
  describe('getPlayer', () => {
    it('Checks if correct player is returned', () => {
      expect(testGame.getPlayer()).toEqual(newPlayer);
    });
  });
  describe('updateFromGameModel', () => {
    it('Export to GameModel from SBGame class', () => {
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id,
        score: 0,
        scoreLimit: 100,
        isOver: false,
        timeLimit: 60,
      });
    });
    it('Export to GameModel from SBGame class with one iteration', () => {
      testGame.onTick('32');
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id,
        score: 1,
        scoreLimit: 100,
        isOver: false,
        timeLimit: 60,
      });
    });
  });
  describe('toGameModel', () => {
    it('Import Game Model to SBGameClass', () => {
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id, // Shouldn't have change
        score: 0,
        scoreLimit: 100,
        isOver: false,
        timeLimit: 60,
      });
      testGame.updateFromModel({
        playerId: newPlayer.id, // Shouldn't have change
        score: 2,
        scoreLimit: 5,
        isOver: false,
        timeLimit: 50,
      });
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id, // Shouldn't have change
        score: 2,
        scoreLimit: 5,
        isOver: false,
        timeLimit: 50,
      });
    });
    it('Import Game Model to SBGameClass when Game is Over', () => {
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id, // Shouldn't have change
        score: 0,
        scoreLimit: 100,
        isOver: false,
        timeLimit: 60,
      });
      testGame.updateFromModel({
        playerId: newPlayer.id, // Shouldn't have change
        score: 2,
        scoreLimit: 2,
        isOver: false,
        timeLimit: 50,
      });
      expect(testGame.toModel()).toEqual({
        playerId: newPlayer.id, // Shouldn't have change
        score: 2,
        scoreLimit: 2,
        isOver: true, // Game is Over
        timeLimit: 50,
      });
    });
  });
});

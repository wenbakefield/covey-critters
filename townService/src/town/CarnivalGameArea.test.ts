import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { PetRule, TownEmitter } from '../types/CoveyTownSocket';
import CarnivalGameArea from './CarnivalGameArea';

describe('CarnivalGameArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: CarnivalGameArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new CarnivalGameArea({ id, petRule: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, petRule: [] });
    });
    it("Clears the player's interactableID and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Remove the GameSession from the CarnivalGameArea once the player leave, and petRule unchange', () => {
      expect(testArea.getGame(newPlayer.id)).not.toBeUndefined();
      expect(testArea.petRule.length).toEqual(0);
      testArea.addPetRule({
        percentileRangeMin: 0,
        percentileRangeMax: 20,
        petSelection: [],
      });
      expect(testArea.petRule.length).toEqual(1);
      testArea.remove(newPlayer);
      expect(() => testArea.getGame(newPlayer.id)).toThrow();
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        petRule: [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 20,
            petSelection: [],
          },
        ],
      });
    });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's interactableID and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
    it('There should exists a GameSession where the Player will be assigned with default value', () => {
      const gameSession = testArea.getGame(newPlayer.id);
      expect(gameSession).not.toBeUndefined();
      expect(gameSession.isOver()).toEqual(false);
      expect(gameSession.getScore()).toEqual(0);
    });
  });
  describe('getGame', () => {
    it('Should retrieve the GameSession with the added Player', () => {
      const gameSession = testArea.getGame(newPlayer.id);
      expect(gameSession).not.toBeUndefined();
    });
    it('Should Throw an error if the player is not in the Interactable', () => {
      expect(() => testArea.getGame('no-exist-player')).toThrow();
    });
  });
  describe('notifyScoreBoard', () => {
    it('Should not push the scored to the scoreboard when the game is not ended', () => {
      expect(testArea.scoreBoard.getTopX(10)).toEqual([]);
      testArea.notifyScoreBoard(newPlayer.id);
      expect(testArea.scoreBoard.getTopX(10)).toEqual([]);
    });
    it('Should push the scored to the scoreboard when the game is ended or overide', () => {
      expect(testArea.scoreBoard.getTopX(10)).toEqual([]);
      testArea.notifyScoreBoard(newPlayer.id, true);
      expect(testArea.scoreBoard.getTopX(10)).toEqual([[newPlayer, 0]]);
    });
    it('Should throw an error if the player is not in the interactable', () => {
      expect(() => testArea.notifyScoreBoard('no-exist-player')).toThrow();
    });
  });
  describe('assignPetToPlayer', () => {});
  describe('addPetRule', () => {
    it('Add new pet rule that does not overlaps with other rules', () => {
      expect(testArea.petRule.length).toEqual(0);
      const newPetRule: PetRule = {
        percentileRangeMin: 0,
        percentileRangeMax: 20,
        petSelection: [],
      };
      testArea.addPetRule(newPetRule);
      expect(testArea.petRule.length).toEqual(1);
      expect(testArea.petRule).toEqual([newPetRule]);
    });
    it('Add multiple pet rule that does not overlaps with other rules', () => {
      expect(testArea.petRule.length).toEqual(0);
      const firstPetRule: PetRule = {
        percentileRangeMin: 0,
        percentileRangeMax: 20,
        petSelection: [],
      };
      const secondPetRule: PetRule = {
        percentileRangeMin: 20,
        percentileRangeMax: 40,
        petSelection: [],
      };
      testArea.addPetRule(firstPetRule);
      testArea.addPetRule(secondPetRule);
      expect(testArea.petRule.length).toEqual(2);
      expect(testArea.petRule).toEqual([firstPetRule, secondPetRule]);
    });
    it('Add multiple pet rule that does overlaps with other rules', () => {
      expect(testArea.petRule.length).toEqual(0);
      const oldPetRule: PetRule = {
        percentileRangeMin: 0,
        percentileRangeMax: 20,
        petSelection: [],
      };
      const newPetRule: PetRule = {
        percentileRangeMin: 0,
        percentileRangeMax: 10,
        petSelection: [],
      };
      testArea.addPetRule(oldPetRule);
      expect(testArea.petRule.length).toEqual(1);
      expect(testArea.petRule).toEqual([oldPetRule]);
      testArea.addPetRule(newPetRule);
      expect(testArea.petRule.length).toEqual(1);
      expect(testArea.petRule).toEqual([newPetRule]);
    });
  });
  test('[toModel] test the CarnivalGameAreaModel Output', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      petRule: [],
    });
  });
  test('[updateModel] updateModel ', () => {
    expect(testArea.id).toBe(id);
    expect(testArea.petRule.length).toEqual(0);
    const newId = 'spam';
    const newPetRule = [
      {
        percentileRangeMin: 0,
        percentileRangeMax: 20,
        petSelection: [],
      },
    ];
    testArea.updateModel({
      id: newId,
      petRule: newPetRule,
    });
    expect(testArea.id).toBe(id);
    expect(testArea.petRule).toBe(newPetRule);
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        CarnivalGameArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new CarnivalGameArea using the provided boundingBox and id, with empty PetRule, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = CarnivalGameArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.petRule.length).toEqual(0);
    });
  });
});

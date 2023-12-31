import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import { CarnivalGameArea as CarnivalGameAreaModel, PetRule } from '../types/CoveyTownSocket';
import SpaceBarGameController from './SBGameController';

/**
 * The events that a CarnivalGameAreaController can emit
 */
export type CarnivalGameAreaEvents = {
  /**
   * A petRuleChange event indicate that the Carnival Game Pet Rule has changed.
   * Listeners are passed the new pet rule to render the effect.
   * @param petRule Represent the new pet rule
   */
  petRuleChange: (petRules: PetRule[]) => void;

  playerJoinGame: (spaceBarGame: SpaceBarGameController) => void;

  playerLeftGame: (playerId: string) => void;
};

export default class CarnivalGameAreaController extends (EventEmitter as new () => TypedEventEmitter<CarnivalGameAreaEvents>) {
  private _model: CarnivalGameAreaModel;

  private _gameSession: SpaceBarGameController[]; // Will need to abstract this if decided to add new kind of Game

  /**
   * Constructs a new CarnivalGameAreaController, initialized with the state of the
   * provided carnivalGameAreaModel.
   *
   * @param carnivalGameAreaModel The carnival game area model that this controller should represent
   */
  constructor(carnivalGameAreaModel: CarnivalGameAreaModel) {
    super();
    this._model = carnivalGameAreaModel;
    this._gameSession = [];
  }

  public get id() {
    return this._model.id;
  }

  public get petRule() {
    return this._model.petRule;
  }

  public set petRule(rules: PetRule[]) {
    if (this._model.petRule !== rules) {
      this._model.petRule = rules;
      this.emit('petRuleChange', rules);
    }
  }

  public addGameSession(gameController: SpaceBarGameController) {
    const existGame = this._gameSession.find(game => game.player === gameController.player);
    if (!existGame) {
      this._gameSession.push(gameController);
    } else {
      this.removeGameSession(gameController.player);
      this._gameSession.push(gameController);
    }
  }

  public removeGameSession(playerId: string) {
    this._gameSession = this._gameSession.filter(game => game.player !== playerId);
  }

  public getGameSessionByID(playerId: string): SpaceBarGameController | undefined {
    const spaceBarGame = this._gameSession.find(game => game.player === playerId);
    if (!spaceBarGame) {
      return undefined;
    } else {
      return spaceBarGame;
    }
  }

  public carnivalGameAreaModel(): CarnivalGameAreaModel {
    return this._model;
  }

  public updateFrom(interactable: CarnivalGameAreaModel) {
    this.petRule = interactable.petRule;
  }
}

export function usePetRule(area: CarnivalGameAreaController): PetRule[] {
  const [petRule, setPetRule] = useState(area.petRule);
  useEffect(() => {
    area.addListener('petRuleChange', setPetRule);
    return () => {
      area.removeListener('petRuleChange', setPetRule);
    };
  }, [area]);
  return petRule;
}

import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import {
  CarnivalGameArea as CarnivalGameAreaModel,
  PetRule,
  GameSession,
  PetOwnerMap,
} from '../types/CoveyTownSocket';

/**
 * The events that a CarnivalGameAreaController can emit
 */
export type CarnivalGameAreaEvents = {
  /**
   * A petRuleChange event indicate that the Carnival Game Pet Rule has changed.
   * Listeners are passed the new pet rule to render the effect.
   * @param petRule Represent the new pet rule
   */
  petRuleChange: (petRule: PetRule | undefined) => void;

  /**
   * A gameModelChange event indicate that the Carnival Game, game session has changed.
   * Listeners are passed the updated game to render the effect.
   * @param gameModel Represent the updated game
   */
  gameModelChange: (gameModel: GameSession | undefined) => void;

  /**
   * A petChange event indicate that the Carnival Game, pet for a player has changed.
   * Listeners are passed the new pet to render the effect.
   * @param gameModel Represent the updated pet
   */
  petChange: (playerPet: PetOwnerMap | undefined) => void;

  /**
   * A gameTimeOut event indicate that the Carnival Game, some game has timeout changed.
   * Listeners are passed the timeout to render the effect.
   * @param gameModel Represent the updated game
   */
  gameTimeOut: (playerId: string) => void;
};

export default class CarnivalGameAreaController extends (EventEmitter as new () => TypedEventEmitter<CarnivalGameAreaEvents>) {
  private _model: CarnivalGameAreaModel;

  /**
   * Constructs a new CarnivalGameAreaController, initialized with the state of the
   * provided carnivalGameAreaModel.
   *
   * @param carnivalGameAreaModel The carnival game area model that this controller should represent
   */
  constructor(carnivalGameAreaModel: CarnivalGameAreaModel) {
    super();
    this._model = carnivalGameAreaModel;
  }
}

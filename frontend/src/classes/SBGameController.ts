import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import TypedEventEmitter from 'typed-emitter';
import { GameSession } from '../types/CoveyTownSocket';

/**
 * The events that a PosterSessionAreaController can emit
 */
export type SpaceBarGameEvents = {
  /**
   * A gameChanged event indicates that the SpaceBarGame state changed.
   * Listeners are passed the new state.
   */
  gameChanged: (newScore: GameSession) => void;
  /**
   * A gameTimeOut event indicate that the Carnival Game, some game has timeout changed.
   * Listeners are passed the timeout to render the effect.
   * @param gameModel Represent the updated game
   */
  gameTimeOut: (isTimeOver: boolean) => void;
};

export default class SpaceBarGameController extends (EventEmitter as new () => TypedEventEmitter<SpaceBarGameEvents>) {
  private readonly _player: string;

  private _score: number;

  private readonly _scoreLimit: number;

  private _isOver: boolean;

  private readonly _timeLimit: number;

  constructor(player: string, scoreLimit: number, timeLimit: number) {
    super();
    this._player = player;
    this._score = 0;
    this._scoreLimit = scoreLimit;
    this._isOver = false;
    this._timeLimit = timeLimit;
  }

  public get score(): number {
    return this._score;
  }

  public set score(newScore: number) {
    if (this.score !== newScore) {
      this._score = newScore;
      this._emitGameChanged();
    }
  }

  public get isOver(): boolean {
    return this._isOver;
  }

  public set isOver(isTimeOver: boolean) {
    if (this.isOver !== isTimeOver) {
      this._isOver = isTimeOver;
      this._emitGameChanged();
      if (isTimeOver) {
        this.emit('gameTimeOut', isTimeOver);
      }
    }
  }

  public get timeLimit(): number {
    return this._timeLimit;
  }

  public get player(): string {
    return this._player;
  }

  public get scoreLimit(): number {
    return this._scoreLimit;
  }

  public toModel(): GameSession {
    const gameModel: GameSession = {
      playerId: this.player,
      score: this.score,
      scoreLimit: this.scoreLimit,
      isOver: this.isOver,
      timeLimit: this.timeLimit,
    };
    return gameModel;
  }

  public updateFrom(gameModel: GameSession) {
    this.score = gameModel.score;
    this.isOver = gameModel.isOver;
  }

  private _emitGameChanged() {
    this.emit('gameChanged', this.toModel());
  }
}

/**
 * A hook that returns the number of score and status of the Space Bar game
 */
export function useSpaceBarGame(controller: SpaceBarGameController): GameSession {
  const [game, setGame] = useState(controller.toModel());
  useEffect(() => {
    controller.addListener('gameChanged', setGame);
    return () => {
      controller.removeListener('gameChanged', setGame);
    };
  }, [controller]);
  return game;
}

/**
 * A hook that returns the the overide game status
 */
export function useIsTimeOver(controller: SpaceBarGameController): boolean {
  const [isTimeOut, setIsTimeOut] = useState(controller.isOver);
  useEffect(() => {
    controller.addListener('gameTimeOut', setIsTimeOut);
    return () => {
      controller.removeListener('gameTimeOut', setIsTimeOut);
    };
  }, [controller]);
  return isTimeOut;
}

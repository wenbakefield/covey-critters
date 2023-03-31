/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CarnivalGameArea } from '../models/CarnivalGameArea';
import type { ConversationArea } from '../models/ConversationArea';
import type { GameSession } from '../models/GameSession';
import type { Pet } from '../models/Pet';
import type { PetRule } from '../models/PetRule';
import type { Player } from '../models/Player';
import type { PlayerScoreTuple } from '../models/PlayerScoreTuple';
import type { PosterSessionArea } from '../models/PosterSessionArea';
import type { Town } from '../models/Town';
import type { TownCreateParams } from '../models/TownCreateParams';
import type { TownCreateResponse } from '../models/TownCreateResponse';
import type { TownSettingsUpdate } from '../models/TownSettingsUpdate';
import type { ViewingArea } from '../models/ViewingArea';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TownsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List all towns that are set to be publicly available
     * @returns Town list of towns
     * @throws ApiError
     */
    public listTowns(): CancelablePromise<Array<Town>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns',
        });
    }

    /**
     * Create a new town
     * @param requestBody The public-facing information for the new town
     * @returns TownCreateResponse The ID of the newly created town, and a secret password that will be needed to update or delete this town.
     * @throws ApiError
     */
    public createTown(
        requestBody: TownCreateParams,
    ): CancelablePromise<TownCreateResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Updates an existing town's settings by ID
     * @param townId town to update
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @param requestBody The updated settings
     * @returns void
     * @throws ApiError
     */
    public updateTown(
        townId: string,
        xCoveyTownPassword: string,
        requestBody: TownSettingsUpdate,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Deletes a town
     * @param townId ID of the town to delete
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @returns void
     * @throws ApiError
     */
    public deleteTown(
        townId: string,
        xCoveyTownPassword: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Creates a conversation area in a given town
     * @param townId ID of the town in which to create the new conversation area
     * @param xSessionToken session token of the player making the request, must match the session token returned when the player joined the town
     * @param requestBody The new conversation area to create
     * @returns void
     * @throws ApiError
     */
    public createConversationArea(
        townId: string,
        xSessionToken: string,
        requestBody: ConversationArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/conversationArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a viewing area in a given town
     * @param townId ID of the town in which to create the new viewing area
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody The new viewing area to create
     * @returns void
     * @throws ApiError
     */
    public createViewingArea(
        townId: string,
        xSessionToken: string,
        requestBody: ViewingArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/viewingArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a poster session area in a given town
     * @param townId ID of the town in which to create the new poster session area
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody The new poster session area to create
     * @returns void
     * @throws ApiError
     */
    public createPosterSessionArea(
        townId: string,
        xSessionToken: string,
        requestBody: PosterSessionArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/posterSessionArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the image contents of a given poster session area in a given town
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public getPosterAreaImageContents(
        townId: string,
        posterSessionId: string,
        xSessionToken: string,
    ): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/imageContents',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Increment the stars of a given poster session area in a given town, as long as there is
     * a poster image. Returns the new number of stars.
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public incrementPosterAreaStars(
        townId: string,
        posterSessionId: string,
        xSessionToken: string,
    ): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/incStars',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a carnival game area in a given town
     * @param townId ID of the town in which to create the new poster session area
     * @param xSessionToken session token of the player making the request, must
     * match the session token returned when the player joined the town
     * @param requestBody The new carnival game area to create
     * @returns void
     * @throws ApiError
     */
    public createCarnivalGameArea(
        townId: string,
        xSessionToken: string,
        requestBody: CarnivalGameArea,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/createCarnivalArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Tells the backend when the game session has reached the time limit so that it will send the score to the scoreboard
     * @param townId
     * @param carnivalAreaId
     * @param xSessionToken
     * @returns GameSession Ok
     * @throws ApiError
     */
    public timeLimitReached(
        townId: string,
        carnivalAreaId: string,
        xSessionToken: string,
    ): CancelablePromise<GameSession> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/CarnivalGameArea/{carnivalAreaId}/timeLimitReach/{playerId}',
            path: {
                'townID': townId,
                'carnivalAreaId': carnivalAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * @param townId
     * @param carnivalAreaId
     * @param xSessionToken
     * @param requestBody
     * @returns PetRule Ok
     * @throws ApiError
     */
    public changePetRule(
        townId: string,
        carnivalAreaId: string,
        xSessionToken: string,
        requestBody: PetRule,
    ): CancelablePromise<Array<PetRule>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/CarnivalGameArea/{carnivalAreaId}/changePetRule',
            path: {
                'townID': townId,
                'carnivalAreaId': carnivalAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * @param townId
     * @param carnivalAreaId
     * @param xSessionToken
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public initializeCarnivalGame(
        townId: string,
        carnivalAreaId: string,
        xSessionToken: string,
        requestBody: GameSession,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/CarnivalGameArea/{carnivalAreaId}/initializeGame',
            path: {
                'townID': townId,
                'carnivalAreaId': carnivalAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid Value Specified`,
            },
        });
    }

    /**
     * @param townId
     * @param xSessionToken
     * @returns Pet Ok
     * @throws ApiError
     */
    public getPetFromPlayerId(
        townId: string,
        xSessionToken: string,
    ): CancelablePromise<Pet> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/Pet',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * @param townId
     * @param name
     * @param xSessionToken
     * @returns void
     * @throws ApiError
     */
    public renamePet(
        townId: string,
        name: string,
        xSessionToken: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/Pet/rename/{name}',
            path: {
                'townID': townId,
                'name': name,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid town values`,
            },
        });
    }

    /**
     * @param townId
     * @returns PlayerScoreTuple Ok
     * @throws ApiError
     */
    public getAllScores(
        townId: string,
    ): CancelablePromise<Array<PlayerScoreTuple>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/Scoreboard',
            path: {
                'townID': townId,
            },
        });
    }

    /**
     * @param townId
     * @param topNumber
     * @returns PlayerScoreTuple Ok
     * @throws ApiError
     */
    public getXScores(
        townId: string,
        topNumber: number,
    ): CancelablePromise<Array<PlayerScoreTuple>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/Scoreboard/{topNumber}',
            path: {
                'townID': townId,
                'topNumber': topNumber,
            },
        });
    }

    /**
     * @param townId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public removePlayer(
        townId: string,
        requestBody: Player,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}/Scoreboard/{Player}',
            path: {
                'townID': townId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param townId
     * @param score
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public addPlayerScore(
        townId: string,
        score: number,
        requestBody: Player,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/Scoreboard/{Player}/{score}',
            path: {
                'townID': townId,
                'score': score,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param townId
     * @param score
     * @returns number Ok
     * @throws ApiError
     */
    public getPercentile(
        townId: string,
        score: number,
    ): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns/{townID}/Scoreboard/percentile/{score}',
            path: {
                'townID': townId,
                'score': score,
            },
        });
    }

    /**
     * @param townId
     * @param carnivalAreaId
     * @param name
     * @param xSessionToken
     * @returns Pet Ok
     * @throws ApiError
     */
    public assignPet(
        townId: string,
        carnivalAreaId: string,
        name: string,
        xSessionToken: string,
    ): CancelablePromise<Pet> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/CarnivalArea/{carnivalAreaId}/assignPet/{name}',
            path: {
                'townID': townId,
                'carnivalAreaId': carnivalAreaId,
                'name': name,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid town values`,
            },
        });
    }

}

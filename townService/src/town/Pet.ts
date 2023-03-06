import IPet from "../lib/IPet";
import { PlayerLocation } from "../types/CoveyTownSocket";
import { nanoid } from 'nanoid';

export enum Species {
    dog = "dog",
    cat = "cat",
    hamster = "hamster",
    gecko = "gecko",
    turtle = "turtle",
    parrot = "parrot",
    dragon = "dragon",
    ghoul = "ghoul"
}

export default class Pet implements IPet {
    private readonly _id: string;
    private _name: string;
    private readonly _species: Species;
    private x_offset: number;
    private y_offset: number;

    constructor(name: string, species: Species, x_offset: number, y_offset: number) {
        this._id = nanoid();
        this._name = name;
        this._species = species;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
    }

    get id(): string {
        return this._id;
    }
    
    get name(): string {
        return this._name;
    }

    get species(): string {
        return this._species;
    }

    set name(value: string) {
        this._name = value;
    }

    nextMovement(playerLocation: PlayerLocation): [number, number] {
        return [playerLocation.x + this.x_offset, playerLocation.y + this.y_offset]
    }

}
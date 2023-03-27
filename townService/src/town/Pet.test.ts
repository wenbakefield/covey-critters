import { MovementType, PlayerLocation, Species } from '../types/CoveyTownSocket';
import Pet from './Pet';

describe('Pet', () => {
  const initialPlayerLocation: PlayerLocation = {
    x: 50,
    y: 100,
    rotation: 'front',
    moving: true,
  };

  let pet: Pet;
  const petName = 'Lemmy';
  const petSpecies = 'brown-mouse';
  const petOffsetX = -40;
  const petOffsetY = -20;

  beforeEach(() => {
    pet = new Pet(petName, petSpecies, 'offsetPlayer', petOffsetX, petOffsetY);
    pet.initializeLocation(initialPlayerLocation);
  });

  it('should have a unique id', () => {
    expect(pet.id).toBeDefined();
  });

  it('should have a name', () => {
    expect(pet.name).toBe(petName);
  });

  it('should change the pet name', () => {
    expect(pet.name).toEqual('Lemmy');
    pet.setPetName('sunny');
    expect(pet.name).toEqual('sunny');
  });

  it('should allow changing the name', () => {
    const newName = 'Ludwig';
    pet.name = newName;
    expect(pet.name).toBe(newName);
  });

  it('should have a species', () => {
    expect(pet.species).toBe(petSpecies);
  });

  it('should have a movement type', () => {
    expect(
      pet.nextMovement({
        x: 0,
        y: 0,
        rotation: 'front',
        moving: false,
      }),
    ).toBeDefined();
  });

  it('nextMovement should return a new correct position', () => {
    const playerLocation = { x: 0, y: 0, rotation: 'front', moving: false };
    const [nextX, nextY] = pet.nextMovement({
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    });
    expect(nextX).toBe(playerLocation.x + petOffsetX);
    expect(nextY).toBe(playerLocation.y + petOffsetY);
  });

  it('nextMovement should correctly calculate coordinates for changing player location', () => {
    let playerLocation = { x: 0, y: 0, rotation: 'front', moving: false };
    let [nextX, nextY] = pet.nextMovement({ x: 0, y: 0, rotation: 'front', moving: false });
    expect(nextX).toBe(playerLocation.x + petOffsetX);
    expect(nextY).toBe(playerLocation.y + petOffsetY);
    playerLocation = { x: 100, y: 200, rotation: 'back', moving: true };
    [nextX, nextY] = pet.nextMovement({ x: 100, y: 200, rotation: 'back', moving: true });
    expect(nextX).toBe(playerLocation.x + petOffsetX);
    expect(nextY).toBe(playerLocation.y + petOffsetY);
    playerLocation = { x: 50, y: 100, rotation: 'left', moving: true };
    [nextX, nextY] = pet.nextMovement({ x: 50, y: 100, rotation: 'left', moving: true });
    expect(nextX).toBe(playerLocation.x + petOffsetX);
    expect(nextY).toBe(playerLocation.y + petOffsetY);
  });

  it('toPetModel should return a corresponding PetModel', () => {
    const petModel = pet.toPetModel();
    expect(petModel?.id).toBeDefined();
    expect(petModel?.name).toBe(petName);
    expect(petModel?.species).toBe(petSpecies);
    expect(petModel?.movementType).toBe('offsetPlayer');
    expect(petModel?.x).toBe(10);
    expect(petModel?.y).toBe(80);
  });

  it('should throw error if pet is assigned a blank name', () => {
    expect(() => {
      pet.name = '';
    }).toThrowError();
  });
});

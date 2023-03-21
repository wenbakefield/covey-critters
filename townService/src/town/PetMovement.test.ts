import { nanoid } from 'nanoid';
import IPet from '../lib/IPet';
import PetFactory from '../lib/PetFactory';
import { MovementType, Pet as PetModel, PlayerLocation, Species } from '../types/CoveyTownSocket';

describe('Testing Pet Decorator and Factory', () => {
  let initialPlayerLocation: PlayerLocation = {
    x: 50,
    y: 100,
    rotation: 'front',
    moving: true,
  };
  let pet: IPet;

  describe('Default OffSet Pet without Decorator', () => {
    beforeEach(() => {
      const petModelOrbital: PetModel = {
        id: nanoid(),
        name: 'lemmy',
        species: 'dog',
        movementType: 'offsetPlayer',
        x: 0,
        y: 0,
      };
      pet = PetFactory.spawnPet(petModelOrbital, initialPlayerLocation);
    });

    it('Checking if the pet is spawn in the correct default location', () => {
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(10);
      expect(exportPet?.y).toEqual(80);
    });
  });

  describe('Orbital Decorator', () => {
    beforeEach(() => {
      initialPlayerLocation = {
        x: 50,
        y: 100,
        rotation: 'front',
        moving: true,
      };
      const petModelOrbital: PetModel = {
        id: nanoid(),
        name: 'lemmy',
        species: 'dog',
        movementType: 'orbitPlayer',
        x: 0,
        y: 0,
      };
      pet = PetFactory.spawnPet(petModelOrbital, initialPlayerLocation);
    });

    it('Checking if the pet is spawn in the correct default location', () => {
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(70);
      expect(exportPet?.y).toEqual(100);
    });

    it('Move the pet to next location when player is moving in x direction and check the location', () => {
      initialPlayerLocation.x = 55;
      pet.nextMovement(initialPlayerLocation);
      let exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(74.99695390312783);
      expect(exportPet?.y).toEqual(100.34904812874566);
      initialPlayerLocation.x = 60;
      pet.nextMovement(initialPlayerLocation);
      exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(79.98341810019362);
      expect(exportPet?.y).toEqual(100.81424875367055);
    });

    it('Move the pet to next location when player is not moving and check the location', () => {
      pet.nextMovement(initialPlayerLocation);
      let exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(69.99695390312783);
      expect(exportPet?.y).toEqual(100.34904812874566);
      pet.nextMovement(initialPlayerLocation);
      exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(69.98781654038191);
      expect(exportPet?.y).toEqual(100.69798993405001);
    });
  });
});

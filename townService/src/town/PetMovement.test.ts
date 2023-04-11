import { nanoid } from 'nanoid';
import IPet from '../lib/IPet';
import PetFactory from '../lib/PetFactory';
import { MovementType, Pet as PetModel, PlayerLocation, Species } from '../types/CoveyTownSocket';
import FollowPlayerMovement from './FollowPlayerMovement';
import Pet from './Pet';
import PetDecorator from './PetDecorator';

describe('Testing Pet Decorator and Factory', () => {
  let initialPlayerLocation: PlayerLocation = {
    x: 50,
    y: 100,
    rotation: 'front',
    moving: true,
  };
  let pet: IPet;

  describe('PetDecorator Abstract Test class', () => {
    beforeEach(() => {
      const petModel: PetModel = {
        id: nanoid(),
        name: 'lemmy',
        species: 'black-bear',
        movementType: 'offsetPlayer',
        x: 0,
        y: 0,
        rotation: 'front',
      };
      pet = new FollowPlayerMovement(
        new Pet(petModel.name, petModel.species, 'offsetPlayer', -40, 20),
        1,
      );
    });

    it('nextMovement', () => {
      pet.nextMovement({
        x: 55,
        y: 100,
        rotation: 'front',
        moving: true,
      });
      const exportPlayer = pet.toPetModel();
      expect(exportPlayer.x).toEqual(55);
      expect(exportPlayer.y).toEqual(100);
      expect(pet.getPetRotation()).toEqual('front');
    });

    it('setPetName', () => {
      pet.setPetName('not lemmy');
      const exportPlayer = pet.toPetModel();
      expect(exportPlayer.name).toEqual('not lemmy');
    });

    it('initializeLocation', () => {
      pet.initializeLocation({
        x: 55,
        y: 100,
        rotation: 'front',
        moving: true,
      });
      const exportPlayer = pet.toPetModel();
      expect(exportPlayer.x).toEqual(55);
      expect(exportPlayer.y).toEqual(100);
      expect(pet.getPetRotation()).toEqual('front');
    });
  });

  describe('Default OffSet Pet without Decorator', () => {
    beforeEach(() => {
      const petModelOrbital: PetModel = {
        id: nanoid(),
        name: 'lemmy',
        species: 'black-bear',
        movementType: 'offsetPlayer',
        x: 0,
        y: 0,
        rotation: 'front',
      };
      pet = PetFactory.spawnPet(petModelOrbital, initialPlayerLocation);
    });

    it('Checking if the pet is spawn in the correct default location', () => {
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(10);
      expect(exportPet?.y).toEqual(120);
      expect(exportPet.rotation).toEqual('front');
    });

    it('Checking the nextmovembet for pet for offsetMovement movement type', () => {
      pet.nextMovement({
        x: 40,
        y: 80,
        rotation: 'left',
        moving: true,
      });
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(0);
      expect(exportPet?.y).toEqual(100);
      expect(exportPet.rotation).toEqual('left');
    });

    it('Checking the getRotation', () => {
      pet.nextMovement({
        x: 40,
        y: 80,
        rotation: 'left',
        moving: true,
      });
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(0);
      expect(exportPet?.y).toEqual(100);
      expect(pet.getPetRotation()).toEqual('left');
    });

    it('Checking the getRotation', () => {
      pet.setPetName('not lemmy');
      const exportPet = pet.toPetModel();
      expect(exportPet.name).toEqual('not lemmy');
    });
  });

  describe('FollowPlayer', () => {
    let playerLocation: PlayerLocation;
    beforeEach(() => {
      initialPlayerLocation = {
        x: 50,
        y: 100,
        rotation: 'front',
        moving: true,
      };
      const petFollowPlayer: PetModel = {
        id: nanoid(),
        name: 'lemmy',
        species: 'black-bear',
        movementType: 'followPlayer',
        x: 0,
        y: 0,
        rotation: 'front',
      };
      pet = PetFactory.spawnPet(petFollowPlayer, initialPlayerLocation);
    });

    it('Checking if the pet is spawn in the correct default location', () => {
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(50);
      expect(exportPet?.y).toEqual(100);
    });

    it('Move the pet to next location when player is moving in x direction and check the location', () => {
      pet.nextMovement({
        x: 55,
        y: 100,
        rotation: 'front',
        moving: true,
      });
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(50);
      expect(exportPet?.y).toEqual(100);
      expect(exportPet.rotation).toEqual('front');
    });
    it('Move the pet to next location when player is moving in x direction and check the location and adjust for direction', () => {
      for (let i = 0; i <= 15; i++) {
        pet.nextMovement({
          x: 55,
          y: 100,
          rotation: 'right',
          moving: true,
        });
      }
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(55);
      expect(exportPet?.y).toEqual(110);
      expect(exportPet.rotation).toEqual('right');
    });

    it('Move the pet to next location when player is moving in x direction and check the location', () => {
      for (let i = 0; i <= 15; i++) {
        pet.nextMovement({
          x: 55,
          y: 100,
          rotation: 'front',
          moving: true,
        });
      }
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(55);
      expect(exportPet?.y).toEqual(100);
      expect(exportPet.rotation).toEqual('front');
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
        species: 'black-bear',
        movementType: 'orbitPlayer',
        x: 0,
        y: 0,
        rotation: 'front',
      };
      pet = PetFactory.spawnPet(petModelOrbital, initialPlayerLocation);
    });

    it('Checking if the pet is spawn in the correct default location', () => {
      const exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(90);
      expect(exportPet?.y).toEqual(100);
    });

    it('Move the pet to next location when player is moving in x direction and check the location', () => {
      initialPlayerLocation.x = 55;
      pet.nextMovement(initialPlayerLocation);
      let exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(94.84778792366981);
      expect(exportPet?.y).toEqual(96.51377029009367);
      initialPlayerLocation.x = 60;
      pet.nextMovement(initialPlayerLocation);
      exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(99.30283162445258);
      expect(exportPet?.y).toEqual(92.56444848717119);
      expect(exportPet.rotation).toEqual('front');
    });

    it('Move the pet to next location when player is not moving and check the location', () => {
      pet.nextMovement(initialPlayerLocation);
      let exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(89.84778792366981);
      expect(exportPet?.y).toEqual(96.51377029009367);
      pet.nextMovement(initialPlayerLocation);
      exportPet = pet.toPetModel();
      expect(exportPet?.x).toEqual(89.39231012048832);
      expect(exportPet?.y).toEqual(93.05407289332278);
      expect(exportPet.rotation).toEqual('front');
    });
  });
});

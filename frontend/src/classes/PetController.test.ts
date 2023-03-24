import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Pet } from '../types/CoveyTownSocket';
import PetController, { PetEvents } from './PetController';

describe('[T2] PetController', () => {
  let testController: PetController;
  const mockListeners = mock<PetEvents>();
  let petModel: Pet;

  beforeEach(() => {
    mockClear(mockListeners);
    petModel = {
      id: nanoid(),
      name: 'lemmy',
      movementType: 'orbitPlayer',
      species: 'brown-cobra' ,
      x: 0,
      y: 0,
    };
    testController = new PetController(petModel);
    testController.addListener('petMovementChange', mockListeners.petMovementChange);
    testController.addListener('petNameChange', mockListeners.petNameChange);
  });

  describe('movementChange', () => {
    beforeEach(() => {
      mockClear(mockListeners);
    });
    it('emit petMovementChange when new location change', () => {
      testController.location = { x: 10, y: 20 };
      expect(mockListeners.petMovementChange).toBeCalled();
      expect(mockListeners.petNameChange).not.toBeCalled();
      expect(testController.location).toEqual({ x: 10, y: 20 });
    });
    it('emit petMovementChange when new location change in x', () => {
      testController.location = { x: 0, y: 20 };
      expect(mockListeners.petMovementChange).toBeCalled();
      expect(mockListeners.petNameChange).not.toBeCalled();
      expect(testController.location).toEqual({ x: 0, y: 20 });
    });
    it('emit petMovementChange when new location change in y', () => {
      testController.location = { x: 10, y: 0 };
      expect(mockListeners.petMovementChange).toBeCalled();
      expect(mockListeners.petNameChange).not.toBeCalled();
      expect(testController.location).toEqual({ x: 10, y: 0 });
    });
    it('does not emit petMovementChange when new location does not change', () => {
      testController.location = { x: 0, y: 0 };
      expect(mockListeners.petMovementChange).not.toBeCalled();
      expect(mockListeners.petNameChange).not.toBeCalled();
      expect(testController.location).toEqual({ x: 0, y: 0 });
    });
  });

  describe('nameChange', () => {
    beforeEach(() => {
      mockClear(mockListeners);
    });
    it('emit petNameChange when name change', () => {
      testController.name = 'mmm';
      expect(mockListeners.petNameChange).toBeCalled();
      expect(mockListeners.petMovementChange).not.toBeCalled();
      expect(testController.name).toEqual('mmm');
    });
    it('does not emit petNameChange when name does notchange', () => {
      testController.name = 'lemmy';
      expect(mockListeners.petNameChange).not.toBeCalled();
      expect(mockListeners.petMovementChange).not.toBeCalled();
      expect(testController.name).toEqual('lemmy');
    });
  });

  it('should out put the orginal model when call toModel', () => {
    expect(testController.toModel()).toEqual(petModel);
  });

  it('should return a controller when petModel is pass into fromModel', () => {
    const pet = PetController.fromModel(petModel);
    expect(pet.toModel()).toEqual(petModel);
  });
});

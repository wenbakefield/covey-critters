import OrbitingMovement from '../town/OrbitingMovement';
import Pet from '../town/Pet';
import { MovementType, Pet as PetModel } from '../types/CoveyTownSocket';
import IPet from './IPet';

class PetFactory {
  static createPet(petModel: PetModel): IPet {
    if (!petModel) {
      throw new Error('Pet Model is undefined');
    } else {
      const pet = new Pet(
        petModel.name,
        petModel.species,
        petModel.x,
        petModel.y,
        petModel.movementType,
      );
      switch (petModel.movementType) {
        case MovementType.OffsetPlayer:
          return new Pet(
            petModel.name,
            petModel.species,
            petModel.x,
            petModel.y,
            petModel.movementType,
          );
          break;
        case MovementType.OrbitPlayer:
          return new OrbitingMovement(pet, 20, 0.5);
          break;
        default:
          throw new Error('Unable to create Pet from Pet Model');
      }
    }
  }
}

import OrbitingMovement from '../town/OrbitingMovement';
import Pet from '../town/Pet';
import { MovementType, Pet as PetModel, PlayerLocation } from '../types/CoveyTownSocket';
import IPet from './IPet';

export default class PetFactory {
  /**
   * Given a PetModel spawn the Pet in the town
   * @param petModel represent pet model that will be used to instantiate
   * @param playerLocation represent the player location that will be used to calculate spawn coordinate
   * @returns newPet represent the Pet class
   */
  static spawnPet(petModel: PetModel, playerLocation: PlayerLocation): IPet {
    /**
     * Will Instantiate Pet From Given Pet Model
     * @param pet Represent the PetModel that will be used to instantiate Pet Class
     * @returns newPet represent the Pet class
     */
    const createPet = (pet: PetModel) => {
      if (!petModel) {
        throw new Error('Pet Model is undefined');
      } else {
        const newPet = new Pet(petModel.name, petModel.species, petModel.movementType);
        switch (petModel.movementType) {
          case 'offsetPlayer':
            return newPet;
            break;
          case 'orbitPlayer':
            return new OrbitingMovement(newPet);
            break;
          default:
            throw new Error('Unable to create Pet from Pet Model');
        }
      }
    };

    const newPet = createPet(petModel);
    newPet.initializeLocation(playerLocation);
    return newPet;
  }
}
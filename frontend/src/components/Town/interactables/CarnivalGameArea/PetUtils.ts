import { nanoid } from 'nanoid';
import { Pet } from '../../../../generated/client';

export function generateDefaultPet(species: string[]): Pet[] {
  return species.map(eachSpecies => {
    return <Pet>{
      id: nanoid(),
      name: eachSpecies,
      species: eachSpecies,
      movementType: 'followPlayer',
      x: 0,
      y: 0,
      rotation: 'front',
    };
  });
}

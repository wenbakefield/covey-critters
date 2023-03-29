import { nanoid } from 'nanoid';
import { Pet } from '../../../../generated/client';

export function generateDefaultPet(species: string[]): Pet[] {
  return species.map(eachSpecies => {
    return <Pet>{
      id: nanoid(),
      name: eachSpecies,
      species: eachSpecies,
      movementType: 'offsetPlayer',
      x: 0,
      y: 0,
    };
  });
}

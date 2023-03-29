import React, { useState } from 'react';
import PetController from '../../../../classes/PetController';
import PlayerController from '../../../../classes/PlayerController';
import { useCarnivalGameAreaController, usePlayers } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Button } from '@chakra-ui/react';
import { Pet } from '../../../../generated/client';
import CarnivalGameAreaController from '../../../../classes/CarnivalGameAreaController';

export function PetPickerDialog(props: {
  isDisable: boolean;
  controller: CarnivalGameAreaController;
  petName: string;
}): JSX.Element {
  const [pet, setPet] = useState<Pet | undefined>(undefined);
  const townController = useTownController();
  const carnivalGameAreaController = useCarnivalGameAreaController(props.controller.id);
  const playerControllers = usePlayers();
  const ourPlayerController = playerControllers.find(
    player => player.id === townController.ourPlayer.id,
  );

  if (!ourPlayerController) {
    throw new Error(`Unable to find player with id ${townController.ourPlayer.id} in the town`);
  }

  async function assignPlayerAPet(ourPlayer: PlayerController) {
    const game = carnivalGameAreaController.getGameSessionByID(townController.ourPlayer.id);
    console.log(game);
    if (game) {
      console.log('game exists');
      if (game.isOver) {
        console.log('game is not over');
        const recievedPet = await townController.assignPetToPlayer(
          carnivalGameAreaController,
          props.petName,
        );
        if (recievedPet) {
          // Want to update player controller to assign Pet Controller
          console.log('pet is recieved');
          const newPetController = PetController.fromModel(recievedPet);
          ourPlayer.pet = newPetController;
          console.log(ourPlayer);
          setPet(recievedPet);
        }
      }
    }
  }
  return (
    <>
      <Button
        isDisabled={props.isDisable}
        colorScheme='gray'
        onClick={() => {
          assignPlayerAPet(townController.ourPlayer);
        }}>
        Get Pet!
      </Button>
    </>
  );
}

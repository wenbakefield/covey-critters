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
    if (game) {
      if (game.isOver) {
        const recievedPet = await townController.assignPetToPlayer(
          carnivalGameAreaController,
          props.petName,
        );
        if (recievedPet) {
          // Want to update player controller to assign Pet Controller
          const newPetController = PetController.fromModel(recievedPet);
          ourPlayer.pet = newPetController;
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

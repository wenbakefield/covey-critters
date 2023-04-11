import React from 'react';
import PetController from '../../../../classes/PetController';
import PlayerController from '../../../../classes/PlayerController';
import { useCarnivalGameAreaController, usePlayers } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { Button } from '@chakra-ui/react';
import CarnivalGameAreaController from '../../../../classes/CarnivalGameAreaController';

export function PetPickerDialog(props: {
  isDisable: boolean;
  controller: CarnivalGameAreaController;
  petName: string;
  onClick: () => void;
}): JSX.Element {
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
    const recievedPet = await townController.assignPetToPlayer(
      carnivalGameAreaController,
      props.petName,
    );
    if (recievedPet) {
      // Want to update player controller to assign Pet Controller
      const newPetController = PetController.fromModel(recievedPet);
      ourPlayer.pet = newPetController;
    }
  }
  return (
    <>
      <Button
        isDisabled={props.isDisable}
        colorScheme='gray'
        onClick={() => {
          assignPlayerAPet(townController.ourPlayer);
          props.onClick();
        }}>
        Get Pet!
      </Button>
    </>
  );
}

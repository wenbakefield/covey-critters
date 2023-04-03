import {
  Button,
  Container,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useCarnivalGameAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import CarnivalGameAreaController, {
  usePetRule,
} from '../../../classes/CarnivalGameAreaController';
import { PetRule } from '../../../generated/client';
import SpaceBarGameController from '../../../classes/SBGameController';
import CarnivalGameAreaInteractable from './CarnivalGameArea';
import NewCarnivalGameArea from './CarnivalGameAreaModal';
import SBGameModal from './SBGameModal';

const SCORE_LIMIT = 500;
const TIME_LIMIT_SECONDS = 100;

/**
 * The PosterImage component does the following:
 * -- renders the image of a PosterSessionArea (in a modal)
 * -- displays the title of the PosterSessionArea as the header of the modal
 * -- displays the number of stars on the poster
 * Along with the number of stars, there is also a button to increment the number of stars on a poster (i.e.
 * where a player can star a poster). Note that a player cannot star a poster more than once (this is tied to
 * the poster itself, not the PosterSessionArea).
 *
 * @param props: A 'controller', which is the PosterSessionArea corresponding to the
 *               current poster session area.
 *             : A 'isOpen' flag, denoting whether or not the modal should open (it should open if the poster exists)
 *             : A 'close' function, to be called when the modal is closed
 */
export function CarnivalGame({
  controller,
  isOpen,
  close,
}: {
  controller: CarnivalGameAreaController;
  isOpen: boolean;
  close: () => void;
}): JSX.Element {
  const petRule = usePetRule(controller);
  const townController = useTownController();
  const toast = useToast();

  // changePetRule given a new pet rule change the pet rule of the carnivalgamearea.
  function changePetRule(rule: PetRule) {
    if (!petRule || !rule) {
      townController.changeCarnivalGamePetRule(controller, rule);
    } else {
      toast({
        title: `Pet Rule does not exists`,
        status: 'error',
      });
    }
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [sbGameController, setSBGameController] = useState<SpaceBarGameController>();
  function playGame() {
    const gameController = new SpaceBarGameController(
      townController.ourPlayer.id,
      SCORE_LIMIT,
      TIME_LIMIT_SECONDS,
    );
    controller.addGameSession(gameController);
    townController.initializeGame(controller, gameController.toModel());
    setSBGameController(gameController);
    setIsPlaying(true);
  }

  function renderGame() {
    if (isPlaying && sbGameController) {
      return (
        <SBGameModal
          controller={controller}
          isOpen={isOpen}
          close={() => {
            close();
            townController.unPause();
          }}
        />
      );
    } else {
      return <Container />;
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      size={'6xl'}
      onClose={() => {
        close();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{'Carnival Game Area'}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}>{renderGame()}</ModalBody>
        {
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={playGame}>
              Play Game
            </Button>
          </ModalFooter>
        }
        {/* </form> */}
      </ModalContent>
    </Modal>
  );
}

/**
 * The PosterViewer monitors the player's interaction with a PosterSessionArea on the map: displaying either
 * a popup to set the poster image and title for a poster session area, or if the image/title is set,
 * a PosterImage modal to display the poster itself.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function CarnivalGameAreaViewer({
  carnivalGameArea,
}: {
  carnivalGameArea: CarnivalGameAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const carnivalGameAreaController = useCarnivalGameAreaController(carnivalGameArea.id);
  const [selectIsOpen, setSelectIsOpen] = useState(carnivalGameAreaController.petRule.length === 0);
  const rule = usePetRule(carnivalGameAreaController);
  useEffect(() => {
    const setPetRule = (petRule: PetRule[]) => {
      if (petRule.length === 0) {
        townController.interactableEmitter.emit('endIteraction', carnivalGameAreaController);
      } else {
        carnivalGameAreaController.petRule = petRule;
      }
    };
    carnivalGameAreaController.addListener('petRuleChange', setPetRule);
    return () => {
      carnivalGameAreaController.removeListener('petRuleChange', setPetRule);
    };
  }, [carnivalGameAreaController, townController]);

  if (rule.length === 0) {
    return <NewCarnivalGameArea />;
  }
  return (
    <>
      <CarnivalGame
        controller={carnivalGameAreaController}
        isOpen={!selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "posterSessionArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(carnivalGameArea);
        }}
      />
    </>
  );
}

/**
 * The PosterViewerWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a poster session area.
 */
export default function CarnivalGameAreaViewerWrapper(): JSX.Element {
  const carnivalArea = useInteractable<CarnivalGameAreaInteractable>('carnivalGameArea');
  if (carnivalArea) {
    return <CarnivalGameAreaViewer carnivalGameArea={carnivalArea} />;
  }
  return <></>;
}

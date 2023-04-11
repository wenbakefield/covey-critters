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
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Heading,
  Text,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
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
import { RuleCard } from './CarnivalGameArea/RuleCard';

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
  const [rank, setRank] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [percentile, setPercentile] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sbGameController, setSBGameController] = useState<SpaceBarGameController>();
  async function playGame() {
    const gameController = new SpaceBarGameController(
      townController.ourPlayer.id,
      SCORE_LIMIT,
      TIME_LIMIT_SECONDS,
    );
    controller.addGameSession(gameController);
    townController.initializeGame(controller, gameController.toModel());
    setSBGameController(gameController);
    setIsPlaying(true);
    toast({
      title: 'Press SpaceBar To Start',
      description: "We've created a game for you. Enjoy!",
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  }

  useEffect(() => {
    async function loadScore() {
      await townController.initalizeScoreboard();
      setRank(townController.scoreboardController.getRankByPlayer(townController.ourPlayer.id));
      setHighestScore(
        townController.scoreboardController.getHighestScoreByPlayer(townController.ourPlayer.id),
      );
      setPercentile(
        townController.scoreboardController.getPredictedPercentile(townController.ourPlayer.id),
      );
    }
    loadScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderRank() {
    const ending = rank % 10;
    const specialCase = rank % 100;
    if (ending == 1 && specialCase != 11) {
      return rank + 'st';
    }
    if (ending == 2 && specialCase != 12) {
      return rank + 'nd';
    }
    if (ending == 3 && specialCase != 13) {
      return rank + 'rd';
    }
    return rank + 'th';
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
      return (
        <Container maxW={'full'}>
          <Text>{`Welcome to SpaceBarGame™ where you will be challenging other players inside the coveyTown by smashing SpaceBar. 
      This is ${SCORE_LIMIT} Dash Game where you will have ${TIME_LIMIT_SECONDS} seconds to complete the challenge. 
      You will be rewarded with our amazing collection of pets, where the higher you score the rarer your pet gets. 
      Click Play Game to Start Now!`}</Text>
          <Heading mt={'10'} as='h4' size='sm' color={'black'}>
            Your Statistic:
          </Heading>
          <StatGroup mt={'5'} color={'black'}>
            <Stat>
              <StatLabel>Rank</StatLabel>
              <StatNumber>{renderRank()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Highest Score</StatLabel>
              <StatNumber>{highestScore}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Percentile</StatLabel>
              <StatNumber>
                {Math.round(percentile * 100)}
                th
              </StatNumber>
            </Stat>
          </StatGroup>
          <Accordion mt={'5'} allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex='1' textAlign='left'>
                    {'Rule'}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <RuleCard petRules={petRule} />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Container>
      );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      size={'4xl'}
      onClose={() => {
        close();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{'Carnival Game Area'}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody color={'gray'} pb={6}>
          {renderGame()}
        </ModalBody>
        {
          <ModalFooter alignContent={'center'}>
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

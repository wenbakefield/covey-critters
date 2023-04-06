import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Box,
  Text,
  Progress,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import TownController, {
  useCarnivalGameAreaController,
  useSpaceBarGameController,
} from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import * as Phaser from 'phaser';
import CarnivalGameAreaController from '../../../classes/CarnivalGameAreaController';
import { PetPickerDialog } from './CarnivalGameArea/PetSelector';

const SPRITE_SPWAN_X = 75;
const SPRITE_SPWAN_Y = 150;

export default function SBGameModal({
  controller,
  isOpen,
  close,
}: {
  controller: CarnivalGameAreaController;
  isOpen: boolean;
  close: () => void;
}): JSX.Element {
  const coveyTownController = useTownController();
  const carnivalGameController = useCarnivalGameAreaController(controller.id);
  const sbGameController = useSpaceBarGameController(coveyTownController.ourPlayer.id);
  const [count, setCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const speed = 750 / sbGameController.scoreLimit;

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(sbGameController.timeLimit);
  useEffect(() => {
    async function terminateGame() {
      const endGame = await coveyTownController.carnivalGameTimeLimitReach(carnivalGameController);
    }

    if (!timeLeft) {
      terminateGame();
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Game
  const gameRef = useRef<HTMLDivElement | undefined>();
  useEffect(() => {
    // Load game assets
    function preload(this: Phaser.Scene) {
      this.load.image('track', '/assets/game/racetrack_resize.png');
      this.load.atlas('atlas', '../assets/atlas/atlas.png', '../assets/atlas/atlas.json');
    }

    // Create game objects
    let sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    function create(this: Phaser.Scene) {
      this.add.image(0, 0, 'track').setOrigin(0);
      const { anims } = this;
      anims.create({
        key: 'misa-right-walk',
        frames: anims.generateFrameNames('atlas', {
          prefix: 'misa-right-walk.',
          start: 0,
          end: 3,
          zeroPad: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
      sprite = this.physics.add
        .sprite(SPRITE_SPWAN_X, SPRITE_SPWAN_Y, 'atlas', 'misa-right')
        .setSize(15, 20);
      sprite.anims.play(`misa-right-walk`, true);
      cursors = this.input.keyboard.createCursorKeys();
    }

    function update() {
      // Move the sprite only when the spacebar is just down
      if (
        Phaser.Input.Keyboard.JustDown(cursors.space) &&
        sbGameController.score < sbGameController.scoreLimit
      ) {
        coveyTownController.emitGameOnTick('32');
        const score = sbGameController.score;
        setCount(score);
        sprite.setX(SPRITE_SPWAN_X + (score + 1) * speed);
      }
    }

    // Define game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 900,
      height: 300,
      parent: gameRef.current,
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    };

    // Create Phaser game instance
    const game = new Phaser.Game(config);

    return () => {
      // Cleanup game instance
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (
      sbGameController.score === sbGameController.scoreLimit ||
      timeLeft === 0 ||
      sbGameController.isOver
    ) {
      setShowPopup(true);
    }
  }, [
    sbGameController.isOver,
    sbGameController.score,
    sbGameController.scoreLimit,
    showPopup,
    timeLeft,
  ]);

  const onClose = () => {
    close();
    setShowPopup(false);
  };

  return (
    <ModalBody>
      <Box mb='40px'>
        <Center>
          <CircularProgress value={(timeLeft / sbGameController.timeLimit) * 100} color='gray.400'>
            <CircularProgressLabel>{timeLeft}</CircularProgressLabel>
          </CircularProgress>
        </Center>
        <Center>
          <Text>
            <Text fontWeight={'bold'}>Time Left: {timeLeft}</Text>
          </Text>
        </Center>
      </Box>
      <Center>
        <div ref={gameRef as React.RefObject<HTMLDivElement>}></div>
      </Center>
      <Progress
        value={(sbGameController.score / sbGameController.scoreLimit) * 100}
        size='xs'
        colorScheme='pink'
      />
      <Center color='black'>
        <Text>Score: {sbGameController.score}</Text>
      </Center>
      <Modal isOpen={showPopup} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize='lg' fontWeight='bold'>
            Game Over
          </ModalHeader>

          <ModalBody>Your score was: {sbGameController.score}</ModalBody>

          <ModalFooter>
            <PetPickerDialog
              isDisable={false}
              controller={controller}
              petName={'lemmy'}
              onClick={onClose}
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ModalBody>
  );
}

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  Center,
  Button,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  useCarnivalGameAreaController,
  useSpaceBarGameController,
} from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import * as Phaser from 'phaser';
import CarnivalGameAreaController from '../../../classes/CarnivalGameAreaController';
import { PetPickerDialog } from './CarnivalGameArea/PetSelector';

const SPEED = 1;
const SPRITE_SPWAN_X = 50;
const SPRITE_SPWAN_Y = 100;

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
  const onClose = () => {
    close();
    setShowPopup(false);
  };

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
    if (!timeLeft) return;
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
      this.load.image('track', '/assets/game/racetrack.png');
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
      if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
        console.log('space bar is pressed');
        coveyTownController.emitGameOnTick('32');
        const score = sbGameController.score;
        setCount(score);
        sprite.setX(SPRITE_SPWAN_X + score * SPEED);
      }
    }

    // Define game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 600,
      height: 200,
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
    if (count === sbGameController.scoreLimit || timeLeft === 0) {
      setShowPopup(true);
    }
  }, [count, sbGameController.scoreLimit, showPopup, timeLeft]);

  return (
    <ModalBody>
      <Center color='black'>Time Limit: {timeLeft}</Center>
      <Center>
        <div ref={gameRef as React.RefObject<HTMLDivElement>}></div>
      </Center>
      <Center color='black'>Score: {count}</Center>
      <Modal isOpen={showPopup} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize='lg' fontWeight='bold'>
            Game Over
          </ModalHeader>

          <ModalBody>Your score was: {count}</ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={onClose}>
              Close
            </Button>
            <PetPickerDialog isDisable={false} controller={controller} petName={'lemmy'} />
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ModalFooter>
        <Center color='white'>Score: {count}</Center>
      </ModalFooter>
    </ModalBody>
  );
}

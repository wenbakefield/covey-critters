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
import SpaceBarGameController from '../../../classes/SBGameController';
import { useSpaceBarGameController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import * as Phaser from 'phaser';

export default function SBGameModal({
  isOpen,
  close,
  SBGameController,
}: {
  isOpen: boolean;
  close: () => void;
  SBGameController: SpaceBarGameController;
}): JSX.Element {
  const coveyTownController = useTownController();
  const sbGameController = useSpaceBarGameController(SBGameController?.player);
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
    if (!timeLeft) {
      coveyTownController.addPlayerScore(count);
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
      this.load.image('track', '/assets/game/racetrack.png');
      this.load.image('sprite', '/assets/atlas/gray-wolf/gray-wolf-1.png');
    }

    // Create game objects
    let sprite: Phaser.GameObjects.Image;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    function create(this: Phaser.Scene) {
      this.add.image(0, 0, 'track').setOrigin(0);
      sprite = this.add.image(50, 100, 'sprite');
      cursors = this.input.keyboard.createCursorKeys();
    }

    // Update game state
    const speed = 1;
    let spaceKeyIsDown = false;

    function update() {
      // Move the sprite only when the spacebar is just down
      if (cursors.space.isDown && !spaceKeyIsDown) {
        sprite.x += speed;
        coveyTownController.emitGameOnTick('32');
        setCount(prev => prev + 1);
        spaceKeyIsDown = true;
      } else if (cursors.space.isUp) {
        spaceKeyIsDown = false;
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
    };

    // Create Phaser game instance
    const game = new Phaser.Game(config);

    return () => {
      // Cleanup game instance
      game.destroy(true);
    };
  }, [coveyTownController, sbGameController.score]);

  useEffect(() => {
    if (count === sbGameController.scoreLimit || timeLeft === 0) {
      setShowPopup(true);
    }
  }, [count, sbGameController.scoreLimit, showPopup, timeLeft]);

  return (
    <ModalContent bg='tomato'>
      <ModalHeader>500 Meter Dash!</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Center color='white'>Time Limit: {timeLeft}</Center>
        <Center>
          <div ref={gameRef as React.RefObject<HTMLDivElement>}></div>
        </Center>
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
            </ModalFooter>
          </ModalContent>
        </Modal>
        <ModalFooter>
          <Center color='white'>Score: {count}</Center>
        </ModalFooter>
      </ModalBody>
    </ModalContent>
  );
}

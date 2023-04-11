import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Center,
  Heading,
  CircularProgress,
  CircularProgressLabel,
  ModalFooter,
  Box,
  Text,
  Input,
} from '@chakra-ui/react';
import CarnivalGameAreaController from '../../../../classes/CarnivalGameAreaController';
import { PetPickerDialog } from './PetSelector';
import React, { ChangeEvent, useEffect, useState } from 'react';
import SpaceBarGameController from '../../../../classes/SBGameController';
import useTownController from '../../../../hooks/useTownController';

export function GameOverModal({
  controller,
  sbGameController,
  showPopup,
  onClose,
}: {
  controller: CarnivalGameAreaController;
  sbGameController: SpaceBarGameController;
  showPopup: boolean;
  onClose: () => void;
}): JSX.Element {
  const [value, setValue] = useState('');
  const [percentile, setPercentile] = useState(0);
  const coveyTownController = useTownController();
  const [loadData, setLoadData] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  useEffect(() => {
    async function terminate() {
      if (sbGameController.isOver && !loadData) {
        await coveyTownController.addPlayerScore(sbGameController.score);
        const percent = await coveyTownController.getPercentile(sbGameController.score);
        setPercentile(percent);
        setLoadData(true);
      }
    }
    terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  return (
    <Modal isOpen={showPopup} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize='lg' fontWeight='bold'>
          Game Over
        </ModalHeader>

        <ModalBody alignItems={'center'} justifyContent='center'>
          <Box display='flex' alignContent={'center'} justifyContent='center'>
            <Center>
              <Heading fontSize={'xs'} fontWeight={'bold'}>
                Your Score
              </Heading>
            </Center>
          </Box>
          <Box display='flex' alignContent={'center'} justifyContent='center'>
            <Center mt={'2'}>
              <CircularProgress
                value={(sbGameController.score / sbGameController.scoreLimit) * 100}
                color='gray'
                size={'100px'}>
                <CircularProgressLabel fontSize={'large'} fontWeight={'bold'}>
                  {sbGameController.score}
                </CircularProgressLabel>
              </CircularProgress>
            </Center>
          </Box>
          <Box display='flex' alignContent={'center'} justifyContent='center'>
            <Center mb={'5'} mt={'2'}>
              <Heading fontSize={'xs'} fontWeight={'normal'}>
                Your Percentile: {Math.round(percentile * 100)}th
              </Heading>
            </Center>
          </Box>
          <Text fontSize='sm' mb='3px'>
            Pet Name:
          </Text>
          <Input
            size={'sm'}
            value={value}
            onChange={handleChange}
            variant='outline'
            placeholder='Your Pet Name'
          />
        </ModalBody>

        <ModalFooter>
          <PetPickerDialog
            isDisable={value.length === 0}
            controller={controller}
            petName={value}
            onClick={onClose}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

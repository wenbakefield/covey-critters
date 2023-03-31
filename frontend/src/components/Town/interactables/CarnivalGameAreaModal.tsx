import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import { CarnivalGameArea, PetRule } from '../../../generated/client';
import useTownController from '../../../hooks/useTownController';
import { PetRuleExplainer } from './CarnivalGameArea/PetRuleExplainer';

export default function NewCarnivalGameArea(): JSX.Element {
  const coveyTownController = useTownController();
  const newCarnivalGameArea = useInteractable('carnivalGameArea');
  const [petRule, setPetRule] = useState<PetRule[]>([
    {
      percentileRangeMin: 0,
      percentileRangeMax: 100,
      petSelection: [
        {
          id: nanoid(),
          name: 'undefined',
          movementType: 'offsetPlayer',
          species: 'black-bear',
          x: 0,
          y: 0,
        },
      ],
    },
  ]);

  const isOpen = newCarnivalGameArea !== undefined;

  useEffect(() => {
    if (newCarnivalGameArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newCarnivalGameArea]);

  const closeModal = useCallback(() => {
    if (newCarnivalGameArea) {
      coveyTownController.interactEnd(newCarnivalGameArea);
    }
  }, [coveyTownController, newCarnivalGameArea]);

  const toast = useToast();

  const createCarnivalGame = useCallback(async () => {
    if (petRule && newCarnivalGameArea) {
      const carnivalGameToCreate: CarnivalGameArea = {
        id: newCarnivalGameArea.name,
        petRule: petRule,
      };
      try {
        await coveyTownController.createCarnivalGameArea(carnivalGameToCreate);
        toast({
          title: 'Carnival Game Area Created!',
          status: 'success',
        });
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create carnival game area',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [petRule, coveyTownController, newCarnivalGameArea, closeModal, toast]);

  return (
    <Modal
      isOpen={isOpen}
      size={'6xl'}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Creating a Carnival Game Area </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createCarnivalGame();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='CarnivalGame'>Own a Carnival</FormLabel>
              <PetRuleExplainer setPetRule={setPetRule} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createCarnivalGame}>
              Create
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

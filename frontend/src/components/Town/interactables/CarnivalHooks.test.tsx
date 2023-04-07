import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { DeepMockProxy, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import CarnivalGameAreaController, {
  CarnivalGameAreaEvents,
} from '../../../classes/CarnivalGameAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { mockTownController } from '../../../TestUtils';
import { CarnivalGame } from './CarnivalGameAreaViewer';

function renderCarnivalArea(
  carnivalGameArea: CarnivalGameAreaController,
  townController: TownController,
) {
  let selectIsOpen = carnivalGameArea.petRule.length === 0;
  const close = () => {
    selectIsOpen = false;
  };
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={townController}>
        <CarnivalGame controller={carnivalGameArea} isOpen={!selectIsOpen} close={close} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Carnival Game Viewer', () => {
  const mockToast = jest.fn();
  let carnivalGameArea: CarnivalGameAreaController;
  type CarnivalGameAreaEventName = keyof CarnivalGameAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    CarnivalGameAreaController,
    [event: CarnivalGameAreaEventName, listener: CarnivalGameAreaEvents[CarnivalGameAreaEventName]]
  >;

  let removeListenerSpy: jest.SpyInstance<
    CarnivalGameAreaController,
    [event: CarnivalGameAreaEventName, listener: CarnivalGameAreaEvents[CarnivalGameAreaEventName]]
  >;

  let townController: DeepMockProxy<TownController>;

  let renderData: RenderResult;
  beforeEach(() => {
    mockClear(mockToast);
    carnivalGameArea = new CarnivalGameAreaController({
      id: `id-${nanoid()}`,
      petRule: [
        {
          percentileRangeMin: 0,
          percentileRangeMax: 100,
          petSelection: [],
        },
      ],
    });
    townController = mockTownController({ carnivalGameAreas: [carnivalGameArea] });

    addListenerSpy = jest.spyOn(carnivalGameArea, 'addListener');
    removeListenerSpy = jest.spyOn(carnivalGameArea, 'removeListener');

    renderData = render(renderCarnivalArea(carnivalGameArea, townController));
  });

  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<CarnivalGameAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): CarnivalGameAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as CarnivalGameAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<CarnivalGameAreaEvents>>(
    eventName: Ev,
  ): CarnivalGameAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as CarnivalGameAreaEvents[Ev];
  }

  describe('Carnival Game Hook', () => {
    it('[REE2] usePetRule Registers exactly one petRuleChange listener', () => {
      act(() => {
        carnivalGameArea.emit('petRuleChange', [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 100,
            petSelection: [
              {
                id: nanoid(),
                name: 'lemmy',
                species: 'white-wolf',
                movementType: 'followPlayer',
                x: 0,
                y: 0,
                rotation: 'front',
              },
            ],
          },
        ]);
      });
      getSingleListenerAdded('petRuleChange');
    });
    it('[REE2] usePetRule Unregisters exactly the same petRuleChange listener on unmounting', () => {
      act(() => {
        carnivalGameArea.emit('petRuleChange', [
          {
            percentileRangeMin: 0,
            percentileRangeMax: 100,
            petSelection: [
              {
                id: nanoid(),
                name: 'lemmy',
                species: 'white-wolf',
                movementType: 'followPlayer',
                x: 0,
                y: 0,
                rotation: 'front',
              },
            ],
          },
        ]);
      });
      const listenerAdded = getSingleListenerAdded('petRuleChange');
      cleanup();
      expect(getSingleListenerRemoved('petRuleChange')).toBe(listenerAdded);
    });
    it('Removes the listeners and adds new ones if the controller changes', () => {
      const origPetRuleChange = getSingleListenerAdded('petRuleChange');

      const newCarnivalArea = new CarnivalGameAreaController({
        id: nanoid(),
        petRule: [],
      });
      const newAddListenerSpy = jest.spyOn(newCarnivalArea, 'addListener');
      renderData.rerender(renderCarnivalArea(newCarnivalArea, townController));

      expect(getSingleListenerRemoved('petRuleChange')).toBe(origPetRuleChange);

      getSingleListenerAdded('petRuleChange', newAddListenerSpy);
    });
  });
});

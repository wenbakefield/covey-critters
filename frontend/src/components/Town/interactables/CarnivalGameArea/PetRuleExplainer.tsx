import React, { useState } from 'react';
import {
  Container,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  Button,
  Text,
} from '@chakra-ui/react';
import { PetRule } from '../../../../generated/client';
import { generateDefaultPet, generateOrbitingPet } from './PetUtils';
import { RuleCard } from './RuleCard';

export type Species =
  | 'black-bear'
  | 'brown-bear'
  | 'brown-cobra'
  | 'brown-mouse'
  | 'brown-sheep'
  | 'brown-snake'
  | 'brown-wolf'
  | 'dark-gray-wolf'
  | 'dark-wolf'
  | 'gray-mouse'
  | 'gray-wolf'
  | 'green-cobra'
  | 'green-snake'
  | 'light-wolf'
  | 'pigeon'
  | 'red-snake'
  | 'seagull'
  | 'white-mouse'
  | 'white-sheep';

const SHIBA_INU_PET_RULE: PetRule[] = [
  {
    percentileRangeMin: 0,
    percentileRangeMax: 20,
    petSelection: generateDefaultPet(['brown-sheep', 'white-sheep']),
  },
  {
    percentileRangeMin: 20,
    percentileRangeMax: 40,
    petSelection: generateDefaultPet(['black-bear', 'white-mouse']),
  },
  {
    percentileRangeMin: 40,
    percentileRangeMax: 60,
    petSelection: generateDefaultPet(['light-wolf', 'brown-wolf']),
  },
  {
    percentileRangeMin: 60,
    percentileRangeMax: 80,
    petSelection: generateDefaultPet(['dark-gray-wolf', 'dark-wolf']),
  },
  {
    percentileRangeMin: 80,
    percentileRangeMax: 100,
    petSelection: generateDefaultPet(['light-wolf']),
  },
];

const FLYING_ANIMAL_RULE: PetRule[] = [
  {
    percentileRangeMin: 0,
    percentileRangeMax: 50,
    petSelection: generateOrbitingPet(['pigeon']),
  },
  {
    percentileRangeMin: 50,
    percentileRangeMax: 100,
    petSelection: generateOrbitingPet(['seagull']),
  },
];

interface Rule {
  name: string;
  rule: PetRule[];
}

const ALL_PET_RULE: Rule[] = [
  { name: 'Shiba Inu', rule: SHIBA_INU_PET_RULE },
  { name: 'Flying Penguins', rule: FLYING_ANIMAL_RULE },
];

export function PetRuleExplainer(props: { setPetRule: (petRule: PetRule[]) => void }): JSX.Element {
  const [option, setOption] = useState<PetRule[]>([]);
  const [ruleName, setRuleName] = useState('');

  function setRule(rule: Rule) {
    setOption(rule.rule);
    props.setPetRule(rule.rule);
    setRuleName(rule.name);
  }

  function ruleAccordionItem(rules: Rule[]) {
    return rules.map(rule => {
      return (
        <AccordionItem key={rule.name}>
          <h2>
            <AccordionButton>
              <Box flex='1' textAlign='left'>
                {rule.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <RuleCard petRules={rule.rule} />
            <Button onClick={() => setRule(rule)}>Select</Button>
          </AccordionPanel>
        </AccordionItem>
      );
    });
  }

  function displaySelectedRule() {
    if (ruleName != '') {
      return <Text>{`Current Rule: ${ruleName}`}</Text>;
    }
  }

  return (
    <>
      <Container maxW='full'>
        <Box mb={'5'}>
          Welcome! You have found a Carnival Game Area! Carnival Game Area is an interactable area
          where you will have a chance to player our infamous SpaceBarGame, and you will received a
          Pet based on your score compared with other players witin in Covey.Town! Since you are the
          first one who found this area you will have a chance to set the reward rule for this game
          and for the rest of the players!
        </Box>
      </Container>
      <Divider />
      <Accordion mb={'5'} allowToggle>
        {ruleAccordionItem(ALL_PET_RULE)}
      </Accordion>
      {displaySelectedRule()}
    </>
  );
}

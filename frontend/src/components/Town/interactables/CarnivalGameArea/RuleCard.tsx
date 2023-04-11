import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, HStack } from '@chakra-ui/react';
import { PetRule } from '../../../../generated/client';

export function RuleCard(props: { petRules: PetRule[] }): JSX.Element {
  function petRuleToRow(rules: PetRule[]) {
    return rules.map(rule => {
      return (
        <Tbody key={`${rule.percentileRangeMin}-${rule.percentileRangeMax}`}>
          <Tr>
            <Td>{`Range ${rule.percentileRangeMin} - ${rule.percentileRangeMax}`}</Td>
            <Td>
              <HStack spacing={2}>
                {rule.petSelection.map(pet => (
                  <Tag key={pet.id}>{pet.species}</Tag>
                ))}
              </HStack>
            </Td>
          </Tr>
        </Tbody>
      );
    });
  }
  return (
    <TableContainer mb={5}>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>{'Score in (Percentile)'}</Th>
            <Th>Pets</Th>
          </Tr>
        </Thead>
        {petRuleToRow(props.petRules)}
      </Table>
    </TableContainer>
  );
}

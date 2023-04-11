import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  Text,
  Badge,
  Avatar,
  Flex,
  Divider,
  Center,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useScoreBoard } from '../../classes/ScoreboardController';
import useTownController from '../../hooks/useTownController';
import misa from '../SocialSidebar/assets/misa-front.png';

/**
 * ScoreBoardList gets all scores and sends them to ScoreBoardView for creating and updating viewing panel.
 */
export default function ScoreBoardView(): JSX.Element {
  const townController = useTownController();
  const scoreboardController = townController.scoreboardController;
  const scoreboard = useScoreBoard(scoreboardController);

  useEffect(() => {
    async function loadScoreboard() {
      await townController.initalizeScoreboard();
    }
    loadScoreboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function topPlayerBadge(index: number) {
    if (index === 0) {
      return (
        <Badge ml='1' colorScheme='yellow'>
          Top Player
        </Badge>
      );
    }
  }

  return (
    <Flex>
      <Box>
        <Heading as='h3' fontSize='m'>
          {'Leader Board'}
        </Heading>
        <Center height='10px'>
          <Divider />
        </Center>
        <UnorderedList m={'0'}>
          {scoreboard.map((playerScoreTuple, index) => {
            return (
              <ListItem key={index}>
                <Box border={'gray'} ml={'3'} mr={'3'} mt={'1'}>
                  <Flex alignItems={'flex-start'}>
                    <Avatar src={misa} size='sm' />
                    <Box ml='3'>
                      <Text fontWeight='bold'>
                        {playerScoreTuple.player.userName}
                        {topPlayerBadge(index)}
                      </Text>
                      <Text fontSize='sm'>Scored: {playerScoreTuple.score}</Text>
                    </Box>
                  </Flex>
                </Box>
                <Divider />
              </ListItem>
            );
          })}
        </UnorderedList>
      </Box>
    </Flex>
  );
}

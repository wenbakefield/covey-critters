import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import { useScoreBoard } from '../../classes/ScoreboardController';
import useTownController from '../../hooks/useTownController';

/**
 * ScoreBoardList gets all scores and sends them to ScoreBoardView for creating and updating viewing panel.
 */
export default function ScoreBoardView(): JSX.Element {
  const townController = useTownController();
  townController.initalizeScoreboard();
  const scoreboardController = townController.scoreboardController;
  const scoreboard = useScoreBoard(scoreboardController);
  console.log(scoreboard);
  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        {'Carnival game Scoreboard'}
      </Heading>
      <UnorderedList>
        {scoreboard.map(playerScoreTuple => {
          return (
            <ListItem key={playerScoreTuple.player.id}>
              <h4>
                {playerScoreTuple.player.userName} : {playerScoreTuple.score}
              </h4>
            </ListItem>
          );
        })}
      </UnorderedList>
    </Box>
  );
}

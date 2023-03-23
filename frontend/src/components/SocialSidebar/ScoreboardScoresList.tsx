import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import ScoreboardController, { useScoreBoard } from '../../classes/ScoreboardController';
import { Player as PlayerModel, PlayerScoreTuple } from '../../types/CoveyTownSocket';

type ScoreBoardViewModel = {
  scores: PlayerScoreTuple[];
};

type ScoreBoardViewProps = {
  area: ScoreboardController;
};

/**
 * ScoreBoardList gets all scores and sends them to ScoreBoardView for creating and updating viewing panel.
 */
function ScoreBoardView({ scores }: ScoreBoardViewModel): JSX.Element {

  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        {'Carnival game Scoreboard'}
      </Heading>
      <UnorderedList>
        {scores.map(playerScoreTuple => {
          return (
            //next pair of lines throw errors.
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
export default function ScoreBoardList({ area }: ScoreBoardViewProps): JSX.Element {
  const scores = useScoreBoard(area);
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Carnival Game Scoreboard:
      </Heading>
      {scores.length === 0 ? <>Scoreboard is empty</> : <ScoreBoardView scores={scores} />}
    </Box>
  );
}

import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React from 'react';
import ScoreboardController, { useScoreBoard } from '../../classes/ScoreboardController';

type ScoreBoardViewProps = {
  area: ScoreboardController;
};

/**
 * ScoreBoardList gets all scores and sends them to ScoreBoardView for creating and updating viewing panel.
 */
function ScoreBoardView({ area }: ScoreBoardViewProps): JSX.Element {
  const scoreboard = useScoreBoard(area);
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
// export default function ScoreBoardList(): JSX.Element {
//   const area = //useScoreBoard(area);
//   return (
//     <Box>
//       <Heading as='h2' fontSize='l'>
//         Carnival Game Scoreboard:
//       </Heading>
//       {scores.length === 0 ? <>Scoreboard is empty</> : <ScoreBoardView scores={scores} />}
//     </Box>
//   );
// }

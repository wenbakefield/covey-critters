import { Box, Heading, ListItem, UnorderedList } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useScoreBoard } from '../../classes/ScoreboardController';
import useTownController from '../../hooks/useTownController';

/**
 * ScoreBoardList gets all scores and sends them to ScoreBoardView for creating and updating viewing panel.
 */
export default function PlayerSpecificScoreBoardView(): JSX.Element {
  const [playerusername, setPlayerusername] = useState('');
  const townController = useTownController();
  townController.initalizeScoreboard();
  const scoreboardController = townController.scoreboardController;
  let scoreboard = useScoreBoard(scoreboardController);
  const handleSubmit = () => {
    scoreboard = scoreboard.filter(tuple => tuple.player.userName === playerusername);
  };
  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        {'Searched username and scores in Carnival game'}
      </Heading>
      <form onClick={handleSubmit}>
        <label>
          Enter player username:
          <input
            type='username of player'
            value={playerusername}
            onChange={e => setPlayerusername(e.target.value)}
          />
        </label>
        <input type='submit' />
      </form>
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

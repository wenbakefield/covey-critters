import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Heading,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
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
  const fullScoreboard = useScoreBoard(scoreboardController);
  let scoreboard = useScoreBoard(scoreboardController);
  const handleSubmit = () => {
    scoreboard = [];
    fullScoreboard.forEach(tuple => {
      scoreboard.push(tuple);
    });
    scoreboard = scoreboard.filter(tuple => tuple.player.userName === playerusername);
  };
  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        Searched username and scores in Carnival game
      </Heading>
      <div>
        <form>
          <FormControl>
            <FormLabel>Enter username:</FormLabel>
            <Input
              type='playerusername'
              placeholder='username'
              onChange={event => setPlayerusername(event.currentTarget.value)}
            />
          </FormControl>
          <Button width='full' mt={4} type='submit' onClick={() => handleSubmit}>
            Search
          </Button>
        </form>
      </div>
      <UnorderedList>
        {scoreboard.map(playerScoreTuple => {
          console.log(playerScoreTuple.player.userName);
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

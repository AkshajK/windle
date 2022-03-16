import { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";

import ListItemText from "@mui/material/ListItemText";
import { get, post } from "../../utilities";

const Game = ({ userName }) => {
  const { communityName, tournamentNameEncoded } = useParams();

  const [chatMessages, setChatMessages] = useState([]);
  const [status, setStatus] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const getSecondsLeft = () => {
    return 0.001 * (startTime.getTime() - new Date().getTime());
  };
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft());
  useEffect(() => {
    const i = setInterval(() => {
      setSecondsLeft(getSecondsLeft());
    }, 1000);
    return clearInterval(i);
  }, []);
  const tournamentName = decodeURI(tournamentNameEncoded);
  useEffect(() => {
    post("/api/enterLobby", { community: communityName, tournamentName }).then(
      ({ chatMessages, status, guesses, participants, startTime }) => {
        setChatMessages(chatMessages);
        setStatus(status);
        setGuesses(guesses);
        setParticipants(participants);
        setStartTime(startTime);
      }
    );
  }, []);
  if (true || status === "waiting") {
    return (
      <>
        <h4>{`Welcome ${userName}`}</h4>
        <Typography
          variant="h1"
          component="h2"
        >{`${tournamentName} starts in ${secondsLeft} seconds`}</Typography>

        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            overflow: "auto",
            maxHeight: 600,
          }}
        >
          {participants.map((user, i) => (
            <ListItem key={i}>
              <ListItemText primary={user.name} secondary={user.rating} />
            </ListItem>
          ))}
        </List>
      </>
    );
  }
};

export default Game;

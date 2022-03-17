import React, { useState, useEffect } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import { socket } from "../../client-socket";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Wordle from "../modules/Wordle.js";
import { get, post } from "../../utilities";

const Game = ({ userName }) => {
  const { communityName, tournamentNameEncoded } = useParams();
  const history = useHistory();
  const [chatMessages, setChatMessages] = useState([]);
  const [status, setStatus] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [tournamentId, setTournamentId] = useState("");
  const tournamentName = decodeURI(tournamentNameEncoded);
  useEffect(() => {
    const joinedLobbyCallback = (data) => {
      console.log(data);
      setParticipants((participantsOld) => participantsOld.concat(data));
    };
    const leftLobbyCallback = (data) => {
      const removed = false;
      const removeOneInstance = (participantsOld) => {
        const participantsNew = participantsOld.concat([]);
        for (var i = 0; i < participantsOld.length; i++) {
          if (participantsNew[i].userId + "" === data.userId + "") {
            participantsNew.splice(i, 1);
            console.log("REMOVED ");
            console.log(data.userId);
            break;
          }
        }
        return participantsNew;
      };
      setParticipants(removeOneInstance);
    };
    const startTournamentCallback = (data) => {
      if (data.tournamentId !== tournamentId) return;
      setStatus("inProgress");
    };
    socket.on("joinedLobby", joinedLobbyCallback);
    socket.on("leftLobby", leftLobbyCallback);
    socket.on("start tournament", startTournamentCallback);
    return () => {
      socket.off("joinedLobby", joinedLobbyCallback);
      socket.off("leftLobby", leftLobbyCallback);
      socket.off("start tournament", startTournamentCallback);
    };
  }, []);
  useEffect(() => {
    let i = 0;
    post("/api/enterLobby", { community: communityName, tournamentName }).then(
      ({ chatMessages, status, guesses, participants, startTime, tournamentId }) => {
        setChatMessages(chatMessages);
        setStatus(status);
        setGuesses(guesses);
        setParticipants(participants);
        setStartTime(startTime);
        setTournamentId(tournamentId);
        i = setInterval(() => {
          setSecondsLeft(
            Math.round(0.001 * (new Date(startTime).getTime() - new Date().getTime()))
          );
        }, 1000);
      }
    );
    return () => clearInterval(i);
  }, []);
  let mainBlock = <></>;
  if (status === "waiting") {
    mainBlock = (
      <React.Fragment>
        <Typography
          variant="h4"
          component="h4"
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
              <ListItemAvatar>
                <Avatar alt={user.name} src={user.picture} />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.rating} />
            </ListItem>
          ))}
        </List>
      </React.Fragment>
    );
  } else if (status === "inProgress") {
    mainBlock = (
      <React.Fragment>
        <Typography variant="h4" component="h4" color="#306AFF">{`${
          -1 * secondsLeft
        } seconds`}</Typography>
        <Wordle tournamentId={tournamentId} />
      </React.Fragment>
    );
  }
  return (
    <>
      <h4>{`Welcome ${userName}`}</h4>
      {mainBlock}
      <Button
        size="small"
        onClick={() => {
          console.log("hi");
          post("/api/exitLobby", { tournamentId });
          history.push(`/${communityName}`);
        }}
      >
        Return to Home
      </Button>
    </>
  );
};

export default Game;

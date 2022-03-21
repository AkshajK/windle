import React, { useState, useEffect, useCallback } from "react";
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
import Guess from "../modules/Guess.js";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Chat from "../modules/Chat.js";
import { get, post } from "../../utilities";
import { secToString, isCorrect } from "../../clientFunctions.js";
const Game = ({ userName, userId }) => {
  const { communityName, tournamentNameEncoded } = useParams();
  const history = useHistory();
  const [chatMessages, setChatMessages] = useState([]);
  const [status, setStatus] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [tournamentId, setTournamentId] = useState("");
  const [finished, setFinished] = useState(false);
  const [answer, setAnswer] = useState("");
  const [myGuesses, setMyGuesses] = useState([]);
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualStartTime, setVirtualStartTime] = useState(new Date());
  const tournamentName = decodeURI(tournamentNameEncoded);
  useEffect(() => {
    setMyGuesses(guesses.filter((g) => g.userId === userId).slice(0, 6));
  }, [guesses]);
  const startTournamentCallback = useCallback(
    (data) => {
      if (data.tournamentId + "" !== tournamentId + "") return;
      setStatus("inProgress");
    },
    [tournamentId]
  );
  useEffect(() => {
    socket.on("start tournament", startTournamentCallback);
    return () => {
      socket.off("start tournament", startTournamentCallback);
    };
  }, [tournamentId]);
  useEffect(() => {
    const joinedLobbyCallback = (data) => {
      setParticipants((participantsOld) => participantsOld.concat(data));
    };
    const leftLobbyCallback = (data) => {
      const removed = false;
      const removeOneInstance = (participantsOld) => {
        const participantsNew = participantsOld.concat([]);
        for (var i = 0; i < participantsOld.length; i++) {
          if (participantsNew[i].userId + "" === data.userId + "") {
            participantsNew.splice(i, 1);
            break;
          }
        }
        return participantsNew;
      };
      setParticipants(removeOneInstance);
    };

    const guessCallback = (data) => {
      setGuesses((guessesOld) => guessesOld.concat(data));
      if (data.userId === userId && (data.correct || data.guessNumber >= 6)) {
        setAnswer(data.answer);
        setFinished(true);
      }
    };
    const messageCallback = (data) => {
      setChatMessages((old) => old.concat(data));
    };
    socket.on("joinedLobby", joinedLobbyCallback);
    socket.on("leftLobby", leftLobbyCallback);
    socket.on("guess", guessCallback);
    socket.on("message", messageCallback);
    return () => {
      socket.off("joinedLobby", joinedLobbyCallback);
      socket.off("leftLobby", leftLobbyCallback);
      socket.off("guess", guessCallback);
      socket.off("message", messageCallback);
    };
  }, []);
  useEffect(() => {
    let i = 0;
    post("/api/enterLobby", { community: communityName, tournamentName }).then(
      ({
        chatMessages,
        status,
        guesses,
        participants,
        startTime,
        tournamentId,
        finished,
        answer,
        isVirtual,
        virtualStartTime,
      }) => {
        setChatMessages(chatMessages);
        setStatus(status);
        setGuesses(guesses);
        setParticipants(participants);
        setStartTime(startTime);
        setTournamentId(tournamentId);
        setFinished(finished);
        setAnswer(answer);
        setIsVirtual(isVirtual);
        setVirtualStartTime(virtualStartTime);
        i = setInterval(() => {
          setSecondsLeft(
            Math.round(
              0.001 *
                (new Date(isVirtual ? virtualStartTime : startTime).getTime() -
                  new Date().getTime())
            )
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
        <Box marginTop="24px" marginBottom="12px">
          <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }}>
            {secondsLeft > 0 ? `${tournamentName} starts in ${secondsLeft} seconds` : ""}
          </Typography>
        </Box>
        <Grid container direction="row" height="calc(100vh - 150px)" width="100%">
          <Box width="calc(50vw - 20px)" height="100%">
            <Chat messages={chatMessages.filter((m) => !m.finished)} tournamentId={tournamentId} />
          </Box>
          <Box width="calc(50vw - 20px)" height="100%">
            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
                overflow: "auto",
                height: "100%",
              }}
            >
              {participants.map((user, i) => (
                <Guess
                  guess={{
                    userName: user.name,
                    userId: user.userId,
                    picture: user.picture,
                    result: ["white", "white", "white", "white", "white"],
                    rating: user.rating,
                  }}
                  size="small"
                  userId={userId}
                />
              ))}
            </List>
          </Box>
        </Grid>
      </React.Fragment>
    );
  } else if (status === "inProgress") {
    const finalGuess = myGuesses.length >= 1 && myGuesses[myGuesses.length - 1];
    const correct = finalGuess ? isCorrect(finalGuess.result) : false;
    let rank = 0;
    let rankText = "";
    if (finished && correct) {
      rank =
        guesses
          .filter((g) => isCorrect(g.result))
          .sort((a, b) => a.virtualSeconds - b.virtualSeconds)
          .findIndex((g) => g.userId === userId) + 1;
      rankText = rank % 10 === 1 ? `${rank}st` : rank % 10 === 2 ? `${rank}nd` : `${rank}th`;
    }
    mainBlock = (
      <React.Fragment>
        <Box marginTop="24px" marginBottom="24px">
          <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }} color="#306AFF">
            {finished
              ? correct
                ? `${rankText} place! You took ${secToString(
                    isVirtual ? finalGuess?.virtualSeconds : finalGuess?.seconds
                  )}`
                : `The word is ${answer.toUpperCase()}`
              : secondsLeft < 0
              ? `${-1 * secondsLeft} seconds`
              : ""}
          </Typography>
        </Box>
        <Grid
          container
          direction="row"
          height={finished ? "calc(80vh - 150px)" : "calc(100vh - 150px)"}
          width="100%"
        >
          <Box width="calc(50vw - 20px)" height="100%">
            <Wordle
              tournamentId={tournamentId}
              guesses={myGuesses}
              finished={finished}
              setGuesses={setGuesses}
            />
          </Box>
          <Box width="calc(50vw - 20px)" height="100%">
            <List
              sx={{
                bgcolor: "background.paper",
                overflow: "auto",
                maxHeight: "100%",
              }}
            >
              {guesses
                .sort((a, b) => b.seconds - a.seconds)
                .filter(
                  (a) => finished || (a.virtual ? a.virtualSeconds : a.seconds) <= -1 * secondsLeft
                )
                .map((g) => (
                  <Guess guess={g} finished={finished} userId={userId} />
                ))}
            </List>
          </Box>
        </Grid>
        {finished && (
          <Box height="20vh" width="100vw">
            <Chat messages={chatMessages.filter((m) => m.finished)} tournamentId={tournamentId} />
          </Box>
        )}
      </React.Fragment>
    );
  }
  return (
    <Box width="100%" height="100%">
      {mainBlock}
      <Box marginTop="32px">
        <Button
          size="small"
          fullWidth
          sx={{ color: "#9453FF" }}
          onClick={() => {
            post("/api/exitLobby", { tournamentId });
            history.push(`/${communityName}`);
          }}
        >
          Return to Home
        </Button>
      </Box>
    </Box>
  );
};

export default Game;

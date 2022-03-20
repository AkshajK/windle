import { useState, useEffect, useCallback } from "react";

import { get, post } from "../../utilities";

import Card from "@mui/material/Card";
import Paper from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

const Wordle = ({ tournamentId, guesses, finished, setGuesses }) => {
  const fiveEmpty = ["", "", "", "", ""];
  const [letters, setLetters] = useState(fiveEmpty.concat([""]).map(() => fiveEmpty.concat([])));
  const [colors, setColors] = useState(
    fiveEmpty.concat("").map(() => fiveEmpty.concat([]).map(() => "#FFFFFF"))
  );
  const [currentRow, setCurrentRow] = useState(0);
  useEffect(() => {
    setLetters((oldLetters) => {
      const sortedGuesses = guesses.sort((a, b) => a.seconds - b.seconds);
      for (var i = 0; i < guesses.length; i++) {
        oldLetters[i] = sortedGuesses[i].guess.split("");
      }
      return oldLetters.map((row) => row.slice());
    });
    setColors((oldColors) => {
      for (var i = 0; i < guesses.length; i++) {
        oldColors[i] = guesses[i].result;
      }
      return oldColors.map((row) => row.slice());
    });
    setCurrentRow(guesses.length);
  }, [guesses]);
  const onInput = (key) => {
    if (key === "Back") {
      removeLetter();
    } else if (key === "Enter") {
      const rowOfGuess = currentRow;
      post("/api/guess", { tournamentId, guess: letters[currentRow].join("") }).then((data) => {
        if (!data.valid) {
          setLetters((oldLetters) => {
            oldLetters[rowOfGuess] = fiveEmpty.slice();
            return oldLetters.map((row) => row.slice());
          });
        }
        if (data.answer) {
          setGuesses(data.guesses);
        }
      });
    } else {
      addLetter(key);
    }
  };
  useEffect(() => {
    const onKeydown = (event) => {
      if (event.keyCode >= 65 && event.keyCode <= 90) {
        onInput(event.key.toLowerCase());
      }

      if (event.key === "Enter") onInput("Enter");
      if (event.key === "Backspace") onInput("Back");
    };

    document.addEventListener("keydown", onKeydown);
    if (finished) {
      document.removeEventListener("keydown", onKeydown);
    }
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onInput, finished]);

  const addLetter = useCallback(
    (newLetter) => {
      newLetter = newLetter.toLowerCase();
      if (currentRow >= 6) return false;
      if (newLetter === newLetter.toUpperCase()) return false;
      setLetters((oldLetters) => {
        let i = 0;
        while (oldLetters[currentRow][i] !== "") {
          i++;
          if (i >= 5) return oldLetters;
        }
        oldLetters[currentRow][i] = newLetter;
        return oldLetters.map((row) => row.slice());
      });

      return true;
    },
    [letters, currentRow]
  );
  const removeLetter = useCallback(() => {
    setLetters((oldLetters) => {
      let i = 4;
      while (oldLetters[currentRow][i] === "") {
        i--;
        if (i < 0) return oldLetters;
      }
      oldLetters[currentRow][i] = "";
      return oldLetters.map((row) => row.slice());
    });
    return true;
  }, [letters, currentRow]);
  return (
    <div width="100%">
      <Grid container spacing={3}>
        {letters.map((row, i) => (
          <Grid container item spacing={2} justifyContent="center">
            {row.map((square, j) => (
              <Grid item>
                <Paper
                  //variant="outlined"
                  square
                  elevation={2}
                  sx={{
                    width: "57px",
                    height: "57px",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: "500",
                    backgroundColor: colors[i][j],
                  }}
                >
                  {square.toUpperCase()}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Wordle;

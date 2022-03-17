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

const Wordle = ({ tournamentId }) => {
  const fiveEmpty = ["", "", "", "", ""];
  const [letters, setLetters] = useState(fiveEmpty.map(() => fiveEmpty));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentLength, setCurrentLength] = useState(0);
  const addLetter = useCallback(
    (newLetter) => {
      newLetter = newLetter.toLowerCase();
      if (currentLength === 5) return false;
      if (newLetter === newLetter.toUpperCase()) return false;
      const newLetters = letters.concat([]);
      newLetters[currentRow][currentLength] = newLetter;
      setLetters(newLetters);
      return true;
    },
    letters,
    currentRow,
    currentLength
  );
  return (
    <Grid container spacing={2}>
      {letters.map((row) => (
        <Grid container item spacing={1}>
          {row.map((square) => (
            <Grid item>
              <Paper
                variant="outlined"
                square
                elevation={3}
                sx={{
                  width: "50px",
                  height: "50px",
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "500",
                }}
              >
                {square.toUpperCase()}
              </Paper>
            </Grid>
          ))}
        </Grid>
      ))}
    </Grid>
  );
};

export default Wordle;

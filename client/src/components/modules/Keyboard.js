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
const letters = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((str) => str.split(""));
letters[2] = ["Back", ...letters[2], "Enter"];
const Keyboard = ({ myGuesses, onInput }) => {
  const colors = Object.fromEntries(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((i) => [i, "#FFFFFF"])
  );
  myGuesses.forEach((guess) => {
    console.log(guess.result);
    for (var i = 0; i < 5; i++) {
      if (guess.result[i] === "green") colors[guess.guess[i].toUpperCase()] = "green";
      else if (guess.result[i] === "yellow" && colors[guess.guess[i].toUpperCase()] !== "green")
        colors[guess.guess[i].toUpperCase()] = "yellow";
    }
  });
  console.log(colors);
  return (
    <div width="100%">
      <Grid container spacing={1}>
        {letters.map((row, i) => (
          <Grid container item spacing={1} justifyContent="center" key={i}>
            {row.map((square, j) => (
              <Grid
                item
                key={i + " " + j}
                onClick={() => {
                  onInput(square);
                }}
              >
                <Paper
                  //variant="outlined"
                  square
                  elevation={2}
                  sx={{
                    width: square.length > 1 ? "56px" : "28px",
                    height: "28px",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: square.length > 1 ? "14px" : "16px",
                    fontWeight: square.length > 1 ? "400" : "500",
                    backgroundColor: colors[square.toUpperCase()],
                  }}
                >
                  {square.length > 1 ? square : square.toUpperCase()}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Keyboard;

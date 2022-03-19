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
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import { secToString, isCorrect } from "../../clientFunctions.js";

const Guess = ({ guess, finished, size, userId }) => {
  const small = size === "small";
  const correct = isCorrect(guess.result);
  return (
    <ListItem selected={correct}>
      <ListItemAvatar>
        <Avatar alt={guess.userName} src={guess.picture} />
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{ color: "#9453FF", fontWeight: "bold" }}
        primary={guess.userName.split(" ")[0]}
        secondary={guess.seconds ? secToString(guess.seconds, true) : guess.rating}
      />
      <Grid
        container
        item
        style={{
          padding: "12px 12px 12px 12px",
          backgroundColor: "#EBEBEB",
          borderRadius: "20px",
          margin: "0px 0px 12px 24px",
          width: "fit-content",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Grid item>
            <Paper
              //variant="outlined"
              square
              elevation={2}
              sx={{
                width: small ? "20px" : "30px",
                height: small ? "20px" : "30px",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                fontSize: small ? "12px" : "16px",
                fontWeight: "500",
                backgroundColor: guess.result[i],
                margin: "4px",
              }}
            >
              {finished && guess.guess?.charAt(i).toUpperCase()}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </ListItem>
  );
};

export default Guess;

import { useState, useEffect, useCallback } from "react";
import useCheckMobileScreen from "./useCheckMobileScreen";

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
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import { secToString, isCorrect, StyledBadge } from "../../clientFunctions.js";

const Guess = ({ guess, finished, size, userId, online, hide, large }) => {
  const isMobile = useCheckMobileScreen();

  const small = size === "small";
  const correct = isCorrect(guess.result);
  return (
    <ListItem selected={correct}>
      {!hide && (
        <ListItemAvatar>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            invisible={!online}
          >
            <Avatar alt={guess.userName} src={guess.picture} />
          </StyledBadge>
        </ListItemAvatar>
      )}
      {!hide && (
        <ListItemText
          primaryTypographyProps={{ color: "#9453FF", fontWeight: "bold" }}
          primary={(guess.userName?.split(" ") || [undefined])[0]}
          secondary={
            guess.seconds
              ? secToString(guess.virtual ? guess.virtualSeconds : guess.seconds, true)
              : guess.rating
          }
        />
      )}
      <Grid
        container
        item
        style={{
          padding: "12px 12px 12px 12px",
          backgroundColor: "#EBEBEB",
          borderRadius: "20px",
          margin: hide ? "0px" : "0px 0px 12px 24px",
          width: "fit-content",
        }}
      >
        {Array.from(Array(guess.guess?.length || 5).keys()).map((i) => (
          <Grid item key={i}>
            <Paper
              //variant="outlined"
              square
              elevation={2}
              sx={{
                width: !large && (small || isMobile) ? "20px" : "30px",
                height: !large && (small || isMobile) ? "20px" : "30px",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                fontSize: !large && (small || isMobile) ? "12px" : "16px",
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

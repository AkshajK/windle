import { useState, useEffect } from "react";

import { get, post } from "../../utilities";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

const PastTournament = ({ tournament }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {new Date(tournament.startTime).toString()}
        </Typography>
        <Typography variant="h5" component="div">
          {tournament.name}
        </Typography>
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
            overflow: "auto",
            maxHeight: 300,
          }}
        >
          {tournament.correctGuesses.map((guess, i) => (
            <ListItem key={i}>
              <ListItemText primary={guess.userName} secondary={guess.seconds} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PastTournament;

import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { get, post } from "../../utilities";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { secToString, isCorrect } from "../../clientFunctions.js";
const colors = ["success", "success", "success", "warning", "error", "error"];
const Tournament = ({ tournament, communityName }) => {
  const listItems = tournament.correctGuesses.map((guess, i) => {
    return (
      <ListItem key={i}>
        <ListItemAvatar>
          <Badge
            badgeContent={guess.guessNumber && guess.guessNumber + "/6"}
            color={guess.guessNumber && colors[guess.guessNumber - 1]}
          >
            <Avatar alt={guess.userName} src={guess.picture} />
          </Badge>
        </ListItemAvatar>
        <ListItemText
          sx={{ marginLeft: "8px" }}
          primary={guess.userName}
          secondary={secToString(guess.virtual ? guess.virtualSeconds : guess.seconds, true)}
        />
      </ListItem>
    );
  });
  const history = useHistory();
  return (
    <Card
      variant={
        tournament.status === "complete" || (tournament.status === "inProgress" && "outlined")
      }
      raised={tournament.status !== "complete" && tournament.status !== "inprogress"}
      sx={{
        margin: "15px 24px 15px 0px",
        backgroundColor: tournament.status === "waiting" && "#B8FFCC",
        //opacity: tournament.status !== "waiting" && "70%",
      }}
    >
      <CardContent>
        <Grid container direction="row" width="100%">
          <Box width="50%">
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {new Date(tournament.startTime).toString().substring(0, 21)}
            </Typography>
            <Typography variant="h6">{tournament.name}</Typography>
            <Button
              size="large"
              onClick={() => {
                history.push(`/${communityName}/${encodeURI(tournament.name)}`);
              }}
            >
              Enter
            </Button>
          </Box>
          <Box width="50%">
            {listItems.length > 0 && (
              <List
                sx={{
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                  overflow: "auto",
                  maxHeight: 300,
                }}
              >
                {listItems}
              </List>
            )}
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Tournament;

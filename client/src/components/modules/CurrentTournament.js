import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

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
import Button from "@mui/material/Button";

const CurrentTournament = ({ tournament, communityName }) => {
  const history = useHistory();
  return (
    <Card raised>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {new Date(tournament.startTime).toString()}
        </Typography>
        <Typography variant="h5" component="div">
          {tournament.name}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => {
            console.log("hi");
            history.push(`/${communityName}/${encodeURI(tournament.name)}`);
          }}
        >
          Enter
        </Button>
      </CardActions>
    </Card>
  );
};

export default CurrentTournament;

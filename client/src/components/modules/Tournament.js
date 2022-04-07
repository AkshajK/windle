import { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "@mui/material/Badge";
import { get, post } from "../../utilities";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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
const Tournament = ({ tournament, communityName, isMobile, admin }) => {
  const [showVirtual, setShowVirtual] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const listItems = tournament.correctGuesses
    .sort((a, b) => {
      if (a.guessNumber && b.guessNumber && a.guessNumber !== b.guessNumber) {
        return a.guessNumber - b.guessNumber;
      }
      return (
        (a.virtual ? a.virtualSeconds : a.seconds) - (b.virtual ? b.virtualSeconds : b.seconds)
      );
    })
    .filter((a) => showVirtual || a.seconds <= 86400)
    .map((guess, i) => {
      return (
        <ListItem
          key={i}
          style={{
            opacity: guess.seconds > 86400 ? 0.7 : 1,
            backgroundColor: tournament.status === "inProgress" && "#B8FFCC",
          }}
        >
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
  if (deleted) return <></>;
  return (
    <Card
      variant={tournament.status === "complete" ? "outlined" : undefined}
      raised={tournament.status !== "complete"}
      sx={{
        margin: isMobile ? "15px 12px 15px 12px" : "15px 24px 15px 0px",
        backgroundColor: tournament.status === "inProgress" && "#B8FFCC",
        //opacity: tournament.status !== "waiting" && "70%",
      }}
    >
      <CardContent>
        {admin && (
          <Button
            variant="contained"
            onClick={() => {
              post("/api/deleteTournament", { tournamentId: tournament.id });
              setDeleted(true);
            }}
          >
            Delete
          </Button>
        )}
        <Grid container direction="row" width="100%">
          <Box width="50%">
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              {new Date(tournament.startTime).toString().substring(0, 10)}
            </Typography>
            <Typography variant="h6">{tournament.name}</Typography>
            <Button
              size="large"
              onClick={() => {
                history.push(`/${communityName}/${encodeURI(tournament.name)}`);
              }}
            >
              {tournament.status === "complete" ? "Compete (Unofficial)" : "Compete"}
            </Button>
          </Box>
          <Box width="50%">
            {tournament.status === "complete" && (
              <ToggleButtonGroup
                color="primary"
                value={showVirtual}
                exclusive
                onChange={() => {
                  setShowVirtual((v) => !v);
                }}
              >
                <ToggleButton value={false}>Official</ToggleButton>
                <ToggleButton value={true}>Unofficial</ToggleButton>
              </ToggleButtonGroup>
            )}
            {listItems.length > 0 && (
              <Fragment>
                <List
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: tournament.status === "inProgress" ? "#B8FFCC" : "background.paper",
                    overflow: "auto",
                    maxHeight: 300,
                  }}
                >
                  {listItems}
                </List>
              </Fragment>
            )}
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Tournament;

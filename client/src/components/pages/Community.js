import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get, post } from "../../utilities";
import Tournament from "../modules/Tournament.js";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
const Community = ({ userName, picture }) => {
  const { communityName } = useParams();
  const [tournaments, setTournaments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  useEffect(() => {
    post("/api/enterCommunity", { name: communityName }).then(({ tournaments, leaderboard }) => {
      console.log(tournaments);
      setTournaments(tournaments);
      setLeaderboard(leaderboard);
    });
  }, []);
  const tournamentsShowing = tournaments.filter(
    (t) => t.status === "waiting" || t.status === "inProgress" || t.status === "complete"
  );

  return (
    <Grid container direction="column" height="100vh" width="100vw">
      <Grid
        container
        direction="row"
        width="250px"
        padding="20px"
        justifyContent="center"
        alignItems="center"
      >
        <Box>
          <Typography
            variant="h4"
            component="span"
            align="center"
            sx={{ fontWeight: "bold", marginRight: "6px" }}
          >
            Windle
          </Typography>
          <Typography
            variant="h4"
            component="span"
            align="center"
            sx={{ fontWeight: "bold" }}
            color="#306AFF"
          >
            {communityName}
          </Typography>
        </Box>
        <Avatar
          alt={userName}
          src={picture}
          sx={{ width: "70px", height: "70px", marginTop: "10px" }}
        />
      </Grid>
      <Box width="calc(100% - 275px)" height="100%" overflow="auto">
        {tournamentsShowing
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .map((t) => (
            <Tournament communityName={communityName} tournament={t} />
          ))}
      </Box>
    </Grid>
  );
};

export default Community;

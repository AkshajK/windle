import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { get, post } from "../../utilities";
import PastTournament from "../modules/PastTournament.js";
import CurrentTournament from "../modules/CurrentTournament.js";

const Community = ({ userName }) => {
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
  const pastTournaments = tournaments.filter((t) => t.status === "complete");
  const currentTournaments = tournaments.filter(
    (t) => t.status === "waiting" || t.status === "inProgress"
  );

  return (
    <>
      {communityName}
      <h4>{`Welcome ${userName}`}</h4>
      {pastTournaments.map((t) => (
        <PastTournament tournament={t} />
      ))}
      {currentTournaments.map((t) => (
        <CurrentTournament communityName={communityName} tournament={t} />
      ))}
    </>
  );
};

export default Community;

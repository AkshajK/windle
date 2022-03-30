import { useState, useEffect, useCallback } from "react";

import { get, post } from "../../utilities";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

const AdminPanel = ({ communityName }) => {
  const [tournamentName, setTournamentName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [lobbyOpen, setLobbyOpen] = useState(60 * 24);
  const [disabled, setDisabled] = useState(false);
  return (
    <Grid
      container
      direction="column"
      width="50%"
      padding="20px"
      margin="20px"
      backgroundColor={"#EBEBEB"}
    >
      <Box marginBottom="20px">
        <TextField
          label="Tournament Name"
          type="text"
          value={tournamentName}
          onChange={(event) => {
            setTournamentName(event.target.value);
          }}
        />
      </Box>
      <Box marginBottom="20px">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            label="DateTimePicker"
            value={startDate}
            onChange={setStartDate}
          />
        </LocalizationProvider>
      </Box>
      <Box>
        <TextField
          label="Time (min) to have lobby open"
          type="number"
          value={lobbyOpen}
          onChange={(event) => {
            setLobbyOpen(event.target.value);
          }}
        />
      </Box>
      <Button
        disabled={disabled}
        onClick={() => {
          setDisabled(true);
          post("/api/newTournament", {
            name: tournamentName,
            communityName,
            startTime: startDate,
            timeToHaveLobbyOpen: lobbyOpen,
          }).then(() => {
            setDisabled(false);
          });
        }}
      >
        Submit
      </Button>
    </Grid>
  );
};

export default AdminPanel;

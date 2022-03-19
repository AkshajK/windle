import { Component, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import { get, post } from "../../utilities.js";

export default function Chat({ messages, tournamentId }) {
  let crop = (str) => {
    if (str.length > 140) {
      str = str.substring(0, 140);
    }
    return str;
  };
  let getLastFew = (number, array) => {
    let sortedArray = array.sort((a, b) => {
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
    let newArray = [];
    for (var i = Math.max(array.length - number, 0); i < array.length; i++) {
      newArray.push(array[i]);
    }
    return newArray;
  };

  const [messageText, setMessageText] = useState("");
  const [lastMessage, setLastMessage] = useState(new Date());

  const formatDate = (duedate) => {
    return (
      new Date(duedate).toString().substring(0, 11) +
      new Date(duedate).toLocaleString([], { hour: "2-digit", minute: "2-digit" })
    );
  };
  return (
    <Box style={{ borderRadius: "0px", padding: "20px", height: "100%", paddingTop: "10px" }}>
      <Box
        //height={"calc(100% - 40px)"}
        style={{
          width: "100%",
          height: "calc(100% - 40px)",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          marginBottom: "auto",
        }}
      >
        <List>
          {getLastFew(50, messages).map((message) => {
            let text = (
              <>
                <div
                  style={{
                    color: "#9453FF",
                    display: "inline",
                    fontWeight: "900",
                    fontSize: "16px",
                    marginLeft: "-4px",
                  }}
                >
                  {message.name?.split(" ")[0]}
                </div>
                <div style={{ display: "inline", fontSize: "16px" }}>
                  {": " + crop(message.text)}
                </div>
              </>
            );

            return (
              <ListItem dense fullWidth key={message._id}>
                <ListItemAvatar>
                  <Avatar alt={message.name} src={message.picture} />
                </ListItemAvatar>
                <Tooltip title={formatDate(message.timestamp)}>
                  <ListItemText>{text}</ListItemText>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <TextField
        label="Message"
        color="primary"
        variant="outlined"
        size="small"
        value={messageText}
        fullWidth
        onChange={(event) => {
          setMessageText(event.target.value);
        }}
        autoFocus
        onKeyPress={(event) => {
          if (event.charCode === 13) {
            if (new Date().getTime() - new Date(lastMessage).getTime() >= 500) {
              setLastMessage(new Date());
              event.preventDefault();

              post("/api/message", {
                text: messageText,
                tournamentId: tournamentId,
              });
              setMessageText("");
            }
          }
        }}
      />
    </Box>
  );
}
